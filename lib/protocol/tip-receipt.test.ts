import { describe, expect, test } from "bun:test";
import { getTipReceivedEventEncoder } from "@/clients/tipmark-protocol/src";
import { address } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";
import { readTipReceipt } from "./tip-receipt";

const supporter = new PublicKey("Vote111111111111111111111111111111111111111");
const payout = new PublicKey("11111111111111111111111111111111");
const profile = new PublicKey("Sysvar1111111111111111111111111111111111111");
const owner = new PublicKey("Config1111111111111111111111111111111111111");

function eventLog() {
  const data = getTipReceivedEventEncoder().encode({
    profile: address(profile.toBase58()),
    profileOwner: address(owner.toBase58()),
    supporter: address(supporter.toBase58()),
    payoutWallet: address(payout.toBase58()),
    amount: 1234n,
    reference: new Uint8Array(32),
    timestamp: 100n,
  });
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) bytes[i] = data[i];
  return `Program data: ${Buffer.from(bytes).toString("base64")}`;
}

function connection(overrides: Record<string, unknown> = {}) {
  return {
    getParsedTransaction: async () => ({
      blockTime: 100,
      meta: {
        err: null,
        logMessages: [eventLog()],
        innerInstructions: [
          {
            index: 0,
            instructions: [
              {
                programId: payout,
                program: "system",
                parsed: {
                  type: "transfer",
                  info: {
                    source: supporter.toBase58(),
                    destination: payout.toBase58(),
                    lamports: 1234,
                  },
                },
              },
            ],
          },
        ],
      },
      transaction: {
        signatures: ["1".repeat(88)],
        message: {
          accountKeys: [
            { pubkey: supporter, signer: true },
            {
              pubkey: new PublicKey(
                "7ZNWrEBx3QnTamR8ZZKwbksKvHhby3bg3W3akiz183TT",
              ),
              signer: false,
            },
          ],
        },
      },
    }),
    getSignatureStatuses: async () => ({
      value: [{ err: null, confirmationStatus: "confirmed" }],
    }),
    ...overrides,
  };
}

describe("protocol tip receipts", () => {
  test("requires a matching event and payout transfer", async () => {
    const receipt = await readTipReceipt("1".repeat(88), connection() as never);
    expect(receipt.event.amount).toBe(1234n);
    expect(String(receipt.event.supporter)).toBe(supporter.toBase58());
  });

  test("rejects a payout mismatch", async () => {
    await expect(
      readTipReceipt(
        "1".repeat(88),
        connection({
          getParsedTransaction: async () => ({
            ...(await connection().getParsedTransaction()),
            meta: {
              ...(await connection().getParsedTransaction()).meta,
              innerInstructions: [
                {
                  index: 0,
                  instructions: [
                    {
                      programId: payout,
                      program: "system",
                      parsed: {
                        type: "transfer",
                        info: {
                          source: supporter.toBase58(),
                          destination: owner.toBase58(),
                          lamports: 1234,
                        },
                      },
                    },
                  ],
                },
              ],
            },
          }),
        }) as never,
      ),
    ).rejects.toThrow("does not match");
  });
});
