import { describe, expect, test } from "bun:test";
import {
  isValidProtocolUsername,
  normalizeUsername,
  parseProtocolUsername,
} from "./username";

/**
 * These fixtures are the parity contract with the program's validator.
 *
 * The grammar is implemented twice — here and in
 * `programs/tipmark_protocol/src/validation.rs` — because a handle that one side
 * accepts and the other rejects is either an unclaimable page or a failed
 * transaction. The two lists must stay byte-identical to the ones in
 * `validation.rs::tests`; changing one without the other is the bug this pair of
 * tests exists to catch.
 */
const ACCEPTED = ["ab", "ada", "ada-lovelace", "creator-42"];
const REJECTED = [
  "a",
  "Ada",
  "ada_lovelace",
  "-ada",
  "ada-",
  "ada--lovelace",
  "this-handle-is-longer-than-thirty-characters",
];

describe("protocol usernames", () => {
  test("normalizes user input into canonical handles", () => {
    expect(normalizeUsername("  Ada Lovelace ")).toBe("ada-lovelace");
  });

  test("matches the program's accepted grammar", () => {
    for (const value of ACCEPTED) {
      expect(isValidProtocolUsername(value)).toBe(true);
    }

    for (const value of REJECTED) {
      expect(isValidProtocolUsername(value)).toBe(false);
    }
  });

  test("throws before deriving a PDA for invalid input", () => {
    expect(() => parseProtocolUsername("ada--lovelace")).toThrow();
  });
});
