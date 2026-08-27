import {
  address,
  fetchEncodedAccount,
  type Address,
  type GetAccountInfoApi,
  type Rpc,
} from "@solana/kit";
import {
  decodeCreatorProfile,
  decodeUsernameRecord,
  type CreatorProfile,
  type UsernameRecord,
} from "@/clients/tipmark-protocol/src";
import { createProtocolRpc, getProtocolConfig } from "./config";
import { getSolanaNetworkConfig } from "@/lib/solana/cluster";
import { deriveProfilePda, deriveUsernamePda } from "./pdas";
import {
  hashProfileMetadata,
  isProfileMetadata,
  type ProfileMetadata,
} from "./metadata";
import { parseProtocolUsername } from "./username";

/** The minimum RPC surface a profile read needs. */
export type ProfileRpc = Rpc<GetAccountInfoApi>;

const MAX_METADATA_BYTES = 64 * 1024;
const USERNAME_RECORD_SIZE = 104n;
const CREATOR_PROFILE_SIZE = 423n;

export class PublicProfileResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicProfileResolutionError";
  }
}

export interface ResolvedMetadata {
  metadata: ProfileMetadata;
  uri: string;
  gatewayUrl: string;
}

export interface ResolvedOnChainProfile {
  source: "on-chain";
  address: Address;
  owner: Address;
  payoutWallet: Address;
  username: string;
  active: boolean;
  metadataUri: string;
  metadataHash: Uint8Array;
  metadata: ProfileMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function configuredGateways(name: string): string[] {
  return (process.env[name] || "")
    .split(",")
    .map((gateway) => gateway.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/**
 * Arweave gateways in preference order for the configured cluster.
 *
 * Devnet Irys uploads are free and are *not* settled to Arweave, so
 * `arweave.net` returns 404 for them; only the Irys devnet node serves them.
 * Ordering by cluster keeps image URLs — which get one URL, not a fallback
 * list — pointing somewhere that actually has the bytes.
 */
function arweaveGateways(): string[] {
  const configured = configuredGateways("NEXT_PUBLIC_ARWEAVE_GATEWAY_URLS");
  const isMainnet = getSolanaNetworkConfig().cluster === "mainnet-beta";
  const defaults = isMainnet
    ? ["https://arweave.net", "https://gateway.irys.xyz"]
    : ["https://devnet.irys.xyz", "https://gateway.irys.xyz"];

  /* A devnet deployment that inherited the mainnet-shaped default list would
     otherwise put arweave.net first and 404 every image. */
  const ordered = isMainnet
    ? configured
    : [
        ...configured.filter((gateway) => gateway.includes("irys")),
        ...configured.filter((gateway) => !gateway.includes("irys")),
      ];

  return [...new Set([...ordered, ...defaults])];
}

export function metadataGatewayUrls(uri: string): string[] {
  const resource = uri.slice(uri.indexOf("://") + 3);
  if (uri.startsWith("ar://")) {
    return arweaveGateways().map((gateway) => `${gateway}/${resource}`);
  }
  if (uri.startsWith("ipfs://")) {
    return [
      ...new Set([
        ...configuredGateways("NEXT_PUBLIC_IPFS_GATEWAY_URLS"),
        "https://ipfs.io/ipfs",
        "https://dweb.link/ipfs",
      ]),
    ].map((gateway) => `${gateway}/${resource}`);
  }
  throw new PublicProfileResolutionError("Unsupported metadata URI.");
}

export function metadataGatewayUrl(uri: string): string {
  return metadataGatewayUrls(uri)[0];
}

type ByteArrayLike = {
  readonly length: number;
  readonly [index: number]: number;
};

function equalBytes(left: ByteArrayLike, right: ByteArrayLike): boolean {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return false;
  }
  return true;
}

function copyBytes(value: ByteArrayLike): Uint8Array {
  const copy = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) copy[i] = value[i];
  return copy;
}

export async function fetchAndVerifyProfileMetadata(
  uri: string,
  expectedHash: Uint8Array,
  options: {
    fetchImpl?: ProfileFetch;
    timeoutMs?: number;
  } = {},
): Promise<ResolvedMetadata> {
  let lastError: unknown;
  for (const gatewayUrl of metadataGatewayUrls(uri)) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? 8_000,
    );
    try {
      const response = await (options.fetchImpl || globalThis.fetch)(
        gatewayUrl,
        {
          headers: { accept: "application/json" },
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        throw new PublicProfileResolutionError(
          `Metadata gateway returned HTTP ${response.status}.`,
        );
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && Number(contentLength) > MAX_METADATA_BYTES) {
        throw new PublicProfileResolutionError(
          "Profile metadata is too large.",
        );
      }

      const body = await response.arrayBuffer();
      if (body.byteLength > MAX_METADATA_BYTES) {
        throw new PublicProfileResolutionError(
          "Profile metadata is too large.",
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(new TextDecoder().decode(body));
      } catch {
        throw new PublicProfileResolutionError("Profile metadata is not JSON.");
      }
      if (!isProfileMetadata(parsed)) {
        throw new PublicProfileResolutionError(
          "Profile metadata has an invalid schema.",
        );
      }

      const actualHash = await hashProfileMetadata(parsed);
      if (!equalBytes(actualHash, expectedHash)) {
        throw new PublicProfileResolutionError(
          "Profile metadata hash mismatch.",
        );
      }

      return { metadata: parsed, uri, gatewayUrl };
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new PublicProfileResolutionError("Profile metadata is unavailable.");
}

function assertProgramOwned(
  account: { programAddress: Address; space: bigint },
  programAddress: Address,
  expectedSpace: bigint,
): void {
  if (
    account.programAddress !== programAddress ||
    account.space !== expectedSpace
  ) {
    throw new PublicProfileResolutionError(
      "Profile account has an invalid owner or size.",
    );
  }
}

function assertUsernameRecord(
  record: UsernameRecord,
  username: string,
  owner: Address,
  profileAddress: Address,
  expectedBump: number,
): void {
  if (
    record.profile !== profileAddress ||
    record.owner !== owner ||
    record.version !== 1 ||
    record.bump !== expectedBump ||
    username.length < 2
  ) {
    throw new PublicProfileResolutionError(
      "Username record relationships are invalid.",
    );
  }
}

function assertProfile(
  profile: CreatorProfile,
  username: string,
  owner: Address,
  expectedBump: number,
): void {
  if (
    profile.owner !== owner ||
    profile.username !== username ||
    profile.version !== 1 ||
    profile.bump !== expectedBump ||
    profile.metadataHash.length !== 32 ||
    copyBytes(profile.metadataHash as unknown as ByteArrayLike).every(
      (byte) => byte === 0,
    )
  ) {
    throw new PublicProfileResolutionError(
      "Profile account relationships are invalid.",
    );
  }
}

/** Resolve a claimed handle from Solana and verify its permanent metadata. */
export async function resolveOnChainProfile(
  rawUsername: string,
  options: {
    rpc?: ProfileRpc;
    programAddress?: Address;
    fetchImpl?: ProfileFetch;
  } = {},
): Promise<ResolvedOnChainProfile | null> {
  const username = parseProtocolUsername(rawUsername);
  const config = getProtocolConfig();
  const programAddress = options.programAddress || config.programAddress;
  const rpc = options.rpc || createProtocolRpc({ ...config, programAddress });
  const usernameAddress = await deriveUsernamePda(username, programAddress);
  const encodedUsername = await fetchEncodedAccount(rpc, usernameAddress[0]);
  if (!encodedUsername.exists) return null;
  assertProgramOwned(encodedUsername, programAddress, USERNAME_RECORD_SIZE);
  const usernameAccount = decodeUsernameRecord(encodedUsername);

  const owner = usernameAccount.data.owner;
  const profileAddress = await deriveProfilePda(owner, programAddress);
  assertUsernameRecord(
    usernameAccount.data,
    username,
    owner,
    profileAddress[0],
    usernameAddress[1],
  );

  const encodedProfile = await fetchEncodedAccount(rpc, profileAddress[0]);
  if (!encodedProfile.exists) {
    throw new PublicProfileResolutionError(
      "Username points to a missing profile.",
    );
  }
  assertProgramOwned(encodedProfile, programAddress, CREATOR_PROFILE_SIZE);
  const profileAccount = decodeCreatorProfile(encodedProfile);
  assertProfile(profileAccount.data, username, owner, profileAddress[1]);

  const metadata = await fetchAndVerifyProfileMetadata(
    profileAccount.data.metadataUri,
    copyBytes(profileAccount.data.metadataHash as unknown as ByteArrayLike),
    { fetchImpl: options.fetchImpl },
  );

  return {
    source: "on-chain",
    address: profileAccount.address,
    owner: profileAccount.data.owner,
    payoutWallet: profileAccount.data.payoutWallet,
    username: profileAccount.data.username,
    active: profileAccount.data.active,
    metadataUri: profileAccount.data.metadataUri,
    metadataHash: copyBytes(
      profileAccount.data.metadataHash as unknown as ByteArrayLike,
    ),
    metadata: metadata.metadata,
    createdAt: new Date(Number(profileAccount.data.createdAt) * 1000),
    updatedAt: new Date(Number(profileAccount.data.updatedAt) * 1000),
  };
}

/** Resolve a protocol profile when a verified event gives only its owner. */
export async function resolveOnChainProfileByOwner(
  rawOwner: string | Address,
  options: {
    rpc?: ProfileRpc;
    programAddress?: Address;
    fetchImpl?: ProfileFetch;
  } = {},
): Promise<ResolvedOnChainProfile | null> {
  const owner = address(rawOwner);
  const config = getProtocolConfig();
  const programAddress = options.programAddress || config.programAddress;
  const rpc = options.rpc || createProtocolRpc({ ...config, programAddress });
  const profileAddress = await deriveProfilePda(owner, programAddress);
  const encodedProfile = await fetchEncodedAccount(rpc, profileAddress[0]);
  if (!encodedProfile.exists) return null;
  assertProgramOwned(encodedProfile, programAddress, CREATOR_PROFILE_SIZE);
  const profileAccount = decodeCreatorProfile(encodedProfile);
  assertProfile(
    profileAccount.data,
    profileAccount.data.username,
    owner,
    profileAddress[1],
  );

  const usernameAddress = await deriveUsernamePda(
    profileAccount.data.username,
    programAddress,
  );
  const encodedUsername = await fetchEncodedAccount(rpc, usernameAddress[0]);
  if (!encodedUsername.exists) {
    throw new PublicProfileResolutionError(
      "Profile is missing its username record.",
    );
  }
  assertProgramOwned(encodedUsername, programAddress, USERNAME_RECORD_SIZE);
  const usernameAccount = decodeUsernameRecord(encodedUsername);
  assertUsernameRecord(
    usernameAccount.data,
    profileAccount.data.username,
    owner,
    profileAddress[0],
    usernameAddress[1],
  );

  const metadata = await fetchAndVerifyProfileMetadata(
    profileAccount.data.metadataUri,
    copyBytes(profileAccount.data.metadataHash as unknown as ByteArrayLike),
    { fetchImpl: options.fetchImpl },
  );

  return {
    source: "on-chain",
    address: profileAccount.address,
    owner: profileAccount.data.owner,
    payoutWallet: profileAccount.data.payoutWallet,
    username: profileAccount.data.username,
    active: profileAccount.data.active,
    metadataUri: profileAccount.data.metadataUri,
    metadataHash: copyBytes(
      profileAccount.data.metadataHash as unknown as ByteArrayLike,
    ),
    metadata: metadata.metadata,
    createdAt: new Date(Number(profileAccount.data.createdAt) * 1000),
    updatedAt: new Date(Number(profileAccount.data.updatedAt) * 1000),
  };
}
