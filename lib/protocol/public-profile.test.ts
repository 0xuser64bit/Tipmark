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
  PublicProfileResolutionError,
  resolveOnChainProfile,
} from "./public-profile";
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

describe("public profile metadata verification", () => {
  test("maps permanent URIs to gateway URLs", () => {
    expect(metadataGatewayUrl("ar://abc")).toBe("https://arweave.net/abc");
    expect(metadataGatewayUrl("ipfs://bafyabc")).toBe(
      "https://ipfs.io/ipfs/bafyabc",
    );
    expect(() =>
      metadataGatewayUrl("https://example.com/profile.json"),
    ).toThrow("Unsupported");
  });

  test("accepts valid metadata and verifies its content hash", async () => {
    const metadata = normalizeProfileMetadata({ displayName: "Ada" });
    const hash = await hashProfileMetadata(metadata);
    const result = await fetchAndVerifyProfileMetadata("ar://metadata", hash, {
      fetchImpl: async () => response(JSON.stringify(metadata)),
    });

    expect(result.metadata).toEqual(metadata);
    expect(result.gatewayUrl).toBe("https://arweave.net/metadata");
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
});
