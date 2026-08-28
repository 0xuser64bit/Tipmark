import { describe, expect, test } from "bun:test";
import { address, type Address, type ReadonlyUint8Array } from "@solana/kit";
import {
  getCreatorProfileEncoder,
  getUsernameRecordEncoder,
  TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
} from "@/clients/tipmark-protocol/src";
import {
  fetchAndVerifyProfileMetadata,
  metadataGatewayUrl,
  metadataGatewayUrls,
  PublicProfileResolutionError,
  resolveOnChainProfile,
} from "./public-profile";
import {
  NonRetryableRpcReadError,
  withEndpointFailover,
} from "@/lib/solana/rpc";
import { hashProfileMetadata, normalizeProfileMetadata } from "./metadata";
import { deriveProfilePda, deriveUsernamePda } from "./pdas";

function response(
  body: string,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(body, {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function accountResponse(
  data: ReadonlyUint8Array,
  owner = TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
  space = BigInt(data.length),
) {
  return {
    data: [Buffer.from(copyBytes(data)).toString("base64"), "base64"],
    executable: false,
    lamports: 1_000_000n,
    owner,
    space,
  };
}

function copyBytes(data: ReadonlyUint8Array): Uint8Array {
  const copy = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) copy[i] = data[i];
  return copy;
}

/**
 * Gateway choice reads the environment, and `bun test` loads `.env`, so each
 * gateway test states the configuration it is asserting about rather than
 * inheriting whatever the developer happens to have set.
 */
function withGatewayEnv(
  env: { cluster?: string; arweave?: string },
  assertion: () => void,
) {
  const previous = {
    cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER,
    arweave: process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URLS,
  };
  if (env.cluster === undefined) delete process.env.NEXT_PUBLIC_SOLANA_CLUSTER;
  else process.env.NEXT_PUBLIC_SOLANA_CLUSTER = env.cluster;
  if (env.arweave === undefined)
    delete process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URLS;
  else process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URLS = env.arweave;

  try {
    assertion();
  } finally {
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER = previous.cluster;
    process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URLS = previous.arweave;
  }
}

describe("public profile metadata verification", () => {
  test("maps permanent URIs to gateway URLs", () => {
    /* Devnet Irys uploads are free and never settle to Arweave, so
       arweave.net 404s them. The first URL is the one an <img> gets, with no
       fallback, so on a non-mainnet cluster it must be an Irys node. */
    withGatewayEnv({ cluster: "devnet" }, () => {
      expect(metadataGatewayUrl("ar://abc")).toBe(
        "https://devnet.irys.xyz/abc",
      );
    });
    expect(metadataGatewayUrl("ipfs://bafyabc")).toBe(
      "https://ipfs.io/ipfs/bafyabc",
    );
    expect(() =>
      metadataGatewayUrl("https://example.com/profile.json"),
    ).toThrow("Unsupported");
  });

  test("prefers arweave.net only on mainnet", () => {
    withGatewayEnv({ cluster: "mainnet-beta" }, () => {
      expect(metadataGatewayUrl("ar://abc")).toBe("https://arweave.net/abc");
    });
  });

  test("demotes a configured arweave.net ahead of an Irys node off mainnet", () => {
    /* The shipped .env.example lists arweave.net first; a devnet deployment
       that copied it must not have every image resolve to a 404. */
    withGatewayEnv(
      {
        cluster: "devnet",
        arweave: "https://arweave.net,https://gateway.irys.xyz",
      },
      () => {
        expect(metadataGatewayUrls("ar://abc")[0]).toBe(
          "https://gateway.irys.xyz/abc",
        );
        expect(metadataGatewayUrls("ar://abc")).toContain(
          "https://arweave.net/abc",
        );
      },
    );
  });

  test("accepts valid metadata and verifies its content hash", async () => {
    const metadata = normalizeProfileMetadata({ displayName: "Ada" });
    const hash = await hashProfileMetadata(metadata);
    const result = await fetchAndVerifyProfileMetadata("ar://metadata", hash, {
      fetchImpl: async () => response(JSON.stringify(metadata)),
    });

    expect(result.metadata).toEqual(metadata);
    expect(result.gatewayUrl).toBe(metadataGatewayUrl("ar://metadata"));
  });

  test("rejects schema, size, and hash violations", async () => {
    const metadata = normalizeProfileMetadata({ displayName: "Ada" });
    const hash = await hashProfileMetadata(metadata);

    await expect(
      fetchAndVerifyProfileMetadata("ar://metadata", hash, {
        fetchImpl: async () => response(JSON.stringify({ version: 1 })),
      }),
    ).rejects.toBeInstanceOf(PublicProfileResolutionError);

    await expect(
      fetchAndVerifyProfileMetadata("ar://metadata", hash, {
        fetchImpl: async () =>
          response(JSON.stringify(metadata), 200, {
            "content-length": "70000",
          }),
      }),
    ).rejects.toThrow("too large");

    await expect(
      fetchAndVerifyProfileMetadata("ar://metadata", new Uint8Array(32), {
        fetchImpl: async () => response(JSON.stringify(metadata)),
      }),
    ).rejects.toThrow("hash mismatch");
  });

  test("resolves program-owned PDA relationships before metadata", async () => {
    const owner = address("11111111111111111111111111111111");
    const payout = address("Vote111111111111111111111111111111111111111");
    const [usernameAddress, usernameBump] = await deriveUsernamePda(
      "ada",
      TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    );
    const [profileAddress, profileBump] = await deriveProfilePda(
      owner,
      TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    );
    const metadata = normalizeProfileMetadata({ displayName: "Ada" });
    const metadataHash = await hashProfileMetadata(metadata);
    const usernameData = getUsernameRecordEncoder().encode({
      owner,
      profile: profileAddress,
      version: 1,
      bump: usernameBump,
      reserved: new Uint8Array(30),
    });
    const encodedProfile = getCreatorProfileEncoder().encode({
      owner,
      payoutWallet: payout,
      username: "ada",
      metadataUri: "ar://metadata",
      metadataHash,
      active: true,
      createdAt: 1_700_000_000n,
      updatedAt: 1_700_000_100n,
      version: 1,
      bump: profileBump,
      reserved: new Uint8Array(62),
    });
    const profileData = new Uint8Array(423);
    profileData.set(copyBytes(encodedProfile));
    const accounts = new Map([
      [usernameAddress, accountResponse(usernameData)],
      [profileAddress, accountResponse(profileData)],
    ]);
    const rpc = {
      getAccountInfo: (accountAddress: Address) => ({
        send: async () => ({ value: accounts.get(accountAddress) || null }),
      }),
    };

    const result = await resolveOnChainProfile("ada", {
      rpc: rpc as never,
      programAddress: TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
      fetchImpl: async () => response(JSON.stringify(metadata)),
    });

    expect(result?.owner).toBe(owner);
    expect(result?.payoutWallet).toBe(payout);
    expect(result?.metadata.displayName).toBe("Ada");
  });

  test("does not shop a verification failure around other endpoints", async () => {
    /* Account reads fail over so an endpoint outage does not make every
       claimed page look unclaimed. A profile that fails verification is a
       different thing: the bytes are already in hand and no other provider can
       change the answer, so it must be rejected on the first endpoint. */
    const attempted: string[] = [];

    expect(new PublicProfileResolutionError("x")).toBeInstanceOf(
      NonRetryableRpcReadError,
    );

    await expect(
      withEndpointFailover(
        ["https://primary.example", "https://secondary.example"],
        (endpoint) => endpoint,
        async (endpoint: string) => {
          attempted.push(endpoint);
          throw new PublicProfileResolutionError(
            "Profile metadata hash mismatch.",
          );
        },
        { attemptsPerEndpoint: 2, retryDelayMs: 0 },
      ),
    ).rejects.toBeInstanceOf(PublicProfileResolutionError);

    expect(attempted).toEqual(["https://primary.example"]);
  });
});
