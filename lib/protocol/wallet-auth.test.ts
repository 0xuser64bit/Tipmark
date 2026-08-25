import { describe, expect, test } from "bun:test";
import {
  decodeWalletAuthorization,
  encodeWalletAuthorization,
  walletChallengeMessage,
} from "./wallet-auth";

describe("wallet authorization", () => {
  test("formats a domain, URI, cluster, nonce, and expiry-bound message", () => {
    expect(
      walletChallengeMessage({
        domain: "tipmark.xyz",
        uri: "https://tipmark.xyz/edit-profile",
        wallet: "Vote111111111111111111111111111111111111111",
        cluster: "devnet",
        nonce: "nonce-1",
        issuedAt: "2026-08-25T00:00:00.000Z",
        expiresAt: "2026-08-25T00:10:00.000Z",
      }),
    ).toContain("Nonce: nonce-1");
  });

  test("round-trips a signed authorization and rejects expiry", () => {
    const value = encodeWalletAuthorization({
      wallet: "Vote111111111111111111111111111111111111111",
      challengeId: "challenge-1",
      expiresAt: 2_000,
    });
    expect(decodeWalletAuthorization(value, 1_000)).toEqual({
      wallet: "Vote111111111111111111111111111111111111111",
      challengeId: "challenge-1",
      expiresAt: 2_000,
    });
    expect(decodeWalletAuthorization(value, 2_000)).toBeNull();
  });

  test("rejects tampered authorization payloads", () => {
    const value = encodeWalletAuthorization({
      wallet: "Vote111111111111111111111111111111111111111",
      challengeId: "challenge-1",
      expiresAt: 2_000,
    });
    const [payload, signature] = value.split(".");
    const tamperedPayload = `${payload.slice(0, -1)}${payload.endsWith("A") ? "B" : "A"}`;
    expect(
      decodeWalletAuthorization(`${tamperedPayload}.${signature}`, 1_000),
    ).toBeNull();
  });
});
