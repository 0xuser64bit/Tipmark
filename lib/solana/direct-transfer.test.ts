import { describe, expect, test } from "bun:test";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { lamportsToSol, solToLamports } from "./amount";
import {
  DirectTransferVerificationError,
  readDirectTransfer,
} from "./direct-transfer";

function createConnection(overrides: Record<string, unknown> = {}) {
  const sender = new PublicKey(new Uint8Array(32).fill(1));
  const recipient = new PublicKey(new Uint8Array(32).fill(2));
  const signature = "1".repeat(88);
  const connection = {
    getParsedTransaction: async () => ({
      slot: 42,
      blockTime: 1_700_000_000,
      meta: { err: null },
      transaction: {
        signatures: [signature],
        message: {
          accountKeys: [
            { pubkey: sender, signer: true, writable: true },
            { pubkey: recipient, signer: false, writable: true },
          ],
          instructions: [
            {
              program: "system",
              programId: SystemProgram.programId,
              parsed: {
                type: "transfer",
                info: {
                  source: sender.toBase58(),
                  destination: recipient.toBase58(),
                  lamports: 50_000_000,
                },
              },
            },
          ],
        },
      },
    }),
    getSignatureStatuses: async () => ({
      value: [{ confirmationStatus: "finalized", err: null }],
    }),
    getBlockTime: async () => 1_700_000_000,
    ...overrides,
  };

  return { connection, sender, recipient, signature };
}

describe("exact SOL amount conversion", () => {
  test("converts decimal SOL to lamports without floating point", () => {
    expect(solToLamports("0.05")).toBe(50_000_000n);
    expect(solToLamports("1.000000001")).toBe(1_000_000_001n);
    expect(solToLamports("2")).toBe(2_000_000_000n);
  });

  test("normalizes lamports for cache storage", () => {
    expect(lamportsToSol(50_000_000n)).toBe("0.05");
    expect(lamportsToSol(1_000_000_001n)).toBe("1.000000001");
  });

  test("rejects imprecise, zero, and negative amounts", () => {
    for (const amount of [
      "0",
      "-1",
      "1.1234567890",
      "1e-3",
      "01",
      "9007199.254740992",
    ]) {
      expect(() => solToLamports(amount)).toThrow();
    }
  });
});

describe("direct SOL transfer verification", () => {
  test("accepts a signed, successful, exact system transfer", async () => {
    const { connection, sender, recipient, signature } = createConnection();

    const result = await readDirectTransfer(signature, connection as never);

    expect(result.signature).toBe(signature);
    expect(result.amountSol).toBe("0.05");
    expect(result.fromPublicKey).toBe(sender.toBase58());
    expect(result.toPublicKey).toBe(recipient.toBase58());
    expect(result.status).toBe("finalized");
  });

  test("rejects an RPC response that omits the requested signature", async () => {
    const { connection, signature } = createConnection({
      getParsedTransaction: async () => ({
        slot: 42,
        blockTime: 1_700_000_000,
        meta: { err: null },
        transaction: {
          signatures: ["2".repeat(88)],
          message: { accountKeys: [], instructions: [] },
        },
      }),
    });

    await expect(
      readDirectTransfer(signature, connection as never),
    ).rejects.toBeInstanceOf(DirectTransferVerificationError);
  });

  test("rejects failed and unsigned transfers", async () => {
    const failed = createConnection({
      getParsedTransaction: async () => ({
        slot: 42,
        blockTime: 1_700_000_000,
        meta: { err: { InstructionError: [0, "Custom"] } },
        transaction: {
          signatures: ["1".repeat(88)],
          message: { accountKeys: [], instructions: [] },
        },
      }),
    });
    await expect(
      readDirectTransfer(failed.signature, failed.connection as never),
    ).rejects.toThrow("failed");

    const unsigned = createConnection();
    const transaction = await unsigned.connection.getParsedTransaction();
    transaction.transaction.message.accountKeys[0].signer = false;
    unsigned.connection.getParsedTransaction = async () => transaction;
    await expect(
      readDirectTransfer(unsigned.signature, unsigned.connection as never),
    ).rejects.toThrow("did not sign");
  });
});
