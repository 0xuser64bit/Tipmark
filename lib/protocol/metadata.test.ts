import { describe, expect, test } from "bun:test";
import {
  bytesToHex,
  canonicalizeProfileMetadata,
  hashProfileMetadata,
  isProfileMetadata,
  normalizeProfileMetadata,
} from "./metadata";

describe("profile metadata", () => {
  const input = {
    displayName: " Ada Lovelace ",
    bio: "  Building open source.  ",
    avatarUri: "ipfs://bafy-avatar",
    coverUri: "ar://cover-transaction",
    x: "ada_lovelace",
  };

  test("normalizes to a bounded, privacy-safe versioned shape", () => {
    const metadata = normalizeProfileMetadata(input);

    expect(metadata).toEqual({
      version: 1,
      displayName: "Ada Lovelace",
      bio: "Building open source.",
      images: { avatar: "ipfs://bafy-avatar", cover: "ar://cover-transaction" },
      links: {
        x: "ada_lovelace",
        instagram: null,
        github: null,
        linkedin: null,
      },
    });
    expect(JSON.stringify(metadata)).not.toContain("email");
  });

  test("rejects mutable image URLs and oversized fields", () => {
    expect(() =>
      normalizeProfileMetadata({
        displayName: "Ada",
        avatarUri: "https://example.com/avatar.png",
      }),
    ).toThrow("content URI");
    expect(() =>
      normalizeProfileMetadata({ displayName: "x".repeat(121) }),
    ).toThrow("maximum length");
  });

  test("canonical JSON and SHA-256 hash are deterministic", async () => {
    const metadata = normalizeProfileMetadata(input);
    const sameValuesDifferentOrder = normalizeProfileMetadata({
      x: "ada_lovelace",
      coverUri: "ar://cover-transaction",
      avatarUri: "ipfs://bafy-avatar",
      bio: "Building open source.",
      displayName: "Ada Lovelace",
    });

    expect(canonicalizeProfileMetadata(metadata)).toBe(
      canonicalizeProfileMetadata(sameValuesDifferentOrder),
    );
    const digest = await hashProfileMetadata(metadata);
    expect(digest).toHaveLength(32);
    expect(bytesToHex(digest)).toHaveLength(64);
  });

  test("only accepts the exact canonical shape", () => {
    const metadata = normalizeProfileMetadata(input);
    expect(isProfileMetadata(metadata)).toBe(true);
    expect(isProfileMetadata({ ...metadata, version: 2 })).toBe(false);
    expect(isProfileMetadata({ ...metadata, extra: "unhashed field" })).toBe(
      false,
    );
  });
});
