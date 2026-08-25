import { describe, expect, test } from "bun:test";
import {
  isValidProtocolUsername,
  normalizeUsername,
  parseProtocolUsername,
} from "./username";

describe("protocol usernames", () => {
  test("normalizes user input into canonical handles", () => {
    expect(normalizeUsername("  Ada Lovelace ")).toBe("ada-lovelace");
  });

  test("matches the program's accepted grammar", () => {
    for (const value of ["ab", "ada", "ada-lovelace", "creator-42"]) {
      expect(isValidProtocolUsername(value)).toBe(true);
    }

    for (const value of ["a", "Ada", "-ada", "ada-", "ada--lovelace"]) {
      expect(isValidProtocolUsername(value)).toBe(false);
    }
  });

  test("throws before deriving a PDA for invalid input", () => {
    expect(() => parseProtocolUsername("ada--lovelace")).toThrow();
  });
});
