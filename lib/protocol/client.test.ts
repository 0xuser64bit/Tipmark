import { describe, expect, test } from "bun:test";
import { address } from "@solana/kit";
import {
  getTipInstructionDataDecoder,
  getTipInstructionDataEncoder,
} from "@/clients/tipmark-protocol/src";
import { deriveProfilePda, deriveUsernamePda } from "./pdas";
import { decodeTipReference, encodeTipReference } from "./reference";

describe("generated protocol client", () => {
  test("derives deterministic and domain-separated PDAs", async () => {
    const owner = address("11111111111111111111111111111111");
    const first = await deriveProfilePda(owner);
    const second = await deriveProfilePda(owner);
    const username = await deriveUsernamePda("ada");

    expect(first).toEqual(second);
    expect(first[0]).not.toBe(username[0]);
  });

  test("round-trips generated tip instruction data", () => {
    const reference = Uint8Array.from({ length: 32 }, (_, index) => index);
    const encoded = getTipInstructionDataEncoder().encode({
      amount: 50_000_000n,
      reference,
    });
    const decoded = getTipInstructionDataDecoder().decode(encoded);

    expect(decoded.amount).toBe(50_000_000n);
    expect(decoded.reference).toEqual(reference);
  });

  test("round-trips the receipt reference", () => {
    const reference = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
    expect(decodeTipReference(encodeTipReference(reference))).toEqual(reference);
  });
});
