import { describe, expect, test } from "bun:test";
import { AccountRole, address } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";
import {
  ProtocolSimulationError,
  simulateAndSendProtocolTransaction,
  toWeb3Instruction,
} from "./transactions";

const testInstruction = toWeb3Instruction({
  programAddress: address("11111111111111111111111111111111"),
  accounts: [],
  data: new Uint8Array(),
});

describe("protocol wallet transaction boundary", () => {
  test("preserves generated Kit account roles and instruction bytes", () => {
    const instruction = toWeb3Instruction({
      programAddress: address("11111111111111111111111111111111"),
      accounts: [
        {
          address: address("Vote111111111111111111111111111111111111111"),
          role: AccountRole.WRITABLE_SIGNER,
        },
      ],
      data: new Uint8Array([1, 2, 3]),
    });

    expect(instruction.programId.toBase58()).toBe(
      "11111111111111111111111111111111",
    );
    expect(instruction.keys[0]).toMatchObject({
      isSigner: true,
      isWritable: true,
    });
    expect([...instruction.data]).toEqual([1, 2, 3]);
  });

  test("refuses to request a wallet signature after failed simulation", async () => {
    let sent = false;
    const connection = {
      getLatestBlockhashAndContext: async () => ({
        context: { slot: 10 },
        value: {
          blockhash: "11111111111111111111111111111111",
          lastValidBlockHeight: 100,
        },
      }),
      simulateTransaction: async () => ({
        value: { err: { InstructionError: [0, "Custom"] }, logs: ["failed"] },
      }),
    };

    await expect(
      simulateAndSendProtocolTransaction({
        connection: connection as never,
        sendTransaction: async () => {
          sent = true;
          return "1".repeat(88);
        },
        feePayer: new PublicKey("11111111111111111111111111111111"),
        instructions: [testInstruction],
      }),
    ).rejects.toBeInstanceOf(ProtocolSimulationError);
    expect(sent).toBe(false);
  });

  test("confirms a simulated wallet transaction", async () => {
    const signature = "1".repeat(88);
    const connection = {
      getLatestBlockhashAndContext: async () => ({
        context: { slot: 10 },
        value: {
          blockhash: "11111111111111111111111111111111",
          lastValidBlockHeight: 100,
        },
      }),
      simulateTransaction: async () => ({
        value: { err: null, logs: [], unitsConsumed: 12_345 },
      }),
      confirmTransaction: async () => ({ value: { err: null } }),
    };

    const result = await simulateAndSendProtocolTransaction({
      connection: connection as never,
      sendTransaction: async () => signature,
      feePayer: new PublicKey("11111111111111111111111111111111"),
      instructions: [testInstruction],
    });

    expect(result).toEqual({
      signature,
      status: "confirmed",
      unitsConsumed: 12_345,
    });
  });
});
