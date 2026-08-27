import { describe, expect, test } from "bun:test";
import { getBase58Decoder, address } from "@solana/kit";
import {
  getTipInstructionDataEncoder,
  getTipReceivedEventEncoder,
  TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
} from "@/clients/tipmark-protocol/src";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { readTipReceipt, readTipReceipts } from "./tip-receipt";

const supporter = new PublicKey("Vote111111111111111111111111111111111111111");
const payout = new PublicKey("11111111111111111111111111111111");
const owner = new PublicKey("Config1111111111111111111111111111111111111");
const protocol = new PublicKey(TIPMARK_PROTOCOL_PROGRAM_ADDRESS);
const [profile] = PublicKey.findProgramAddressSync(
  [Buffer.from("profile"), owner.toBuffer()],
  protocol,
);
const reference = Uint8Array.from({ length: 32 }, (_, index) => index + 1);

function eventLog() {
  const data = getTipReceivedEventEncoder().encode({
    profile: address(profile.toBase58()),
    profileOwner: address(owner.toBase58()),
    supporter: address(supporter.toBase58()),
    payoutWallet: address(payout.toBase58()),
    amount: 1234n,
    reference,
    timestamp: 100n,
  });
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) bytes[i] = data[i];
  return `Program data: ${Buffer.from(bytes).toString("base64")}`;
}

function connection(overrides: Record<string, unknown> = {}) {
  const tipData = getTipInstructionDataEncoder().encode({
    amount: 1234n,
    reference,
  });
  return {
    getParsedTransaction: async () => ({
      blockTime: 100,
      meta: {
        err: null,
        logMessages: [
          `Program ${protocol.toBase58()} invoke [1]`,
          eventLog(),
          `Program ${protocol.toBase58()} success`,
        ],
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
            { pubkey: protocol, signer: false },
          ],
          instructions: [
            {
              programId: protocol,
              accounts: [supporter, profile, payout, SystemProgram.programId],
              data: getBase58Decoder().decode(tipData),
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

  test("rejects an event that is not emitted by the protocol program", async () => {
    await expect(
      readTipReceipt(
        "1".repeat(88),
        connection({
          getParsedTransaction: async () => ({
            ...(await connection().getParsedTransaction()),
            meta: {
              ...(await connection().getParsedTransaction()).meta,
              logMessages: [eventLog()],
            },
          }),
        }) as never,
      ),
    ).rejects.toThrow("TipReceived event");
  });

  test("rejects protocol instructions with a forged discriminator", async () => {
    const transaction = await connection().getParsedTransaction();
    const instruction = transaction.transaction.message.instructions[0];
    const forgedData = getTipInstructionDataEncoder().encode({
      amount: 1234n,
      reference,
    });
    (forgedData as unknown as { [index: number]: number })[0] ^= 0xff;

    await expect(
      readTipReceipt(
        "1".repeat(88),
        connection({
          getParsedTransaction: async () => ({
            ...transaction,
            transaction: {
              ...transaction.transaction,
              message: {
                ...transaction.transaction.message,
                instructions: [
                  {
                    ...instruction,
                    data: getBase58Decoder().decode(forgedData),
                  },
                ],
              },
            },
          }),
        }) as never,
      ),
    ).rejects.toThrow("protocol tip instruction");
  });

  test("rejects an event whose profile is not derived from its owner", async () => {
    const forgedEvent = getTipReceivedEventEncoder().encode({
      profile: address(
        new PublicKey("Sysvar1111111111111111111111111111111111111").toBase58(),
      ),
      profileOwner: address(owner.toBase58()),
      supporter: address(supporter.toBase58()),
      payoutWallet: address(payout.toBase58()),
      amount: 1234n,
      reference,
      timestamp: 100n,
    });
    const forgedLog = `Program data: ${Buffer.from(
      Uint8Array.from(forgedEvent as unknown as ArrayLike<number>),
    ).toString("base64")}`;

    await expect(
      readTipReceipt(
        "1".repeat(88),
        connection({
          getParsedTransaction: async () => ({
            ...(await connection().getParsedTransaction()),
            meta: {
              ...(await connection().getParsedTransaction()).meta,
              logMessages: [
                `Program ${protocol.toBase58()} invoke [1]`,
                forgedLog,
                `Program ${protocol.toBase58()} success`,
              ],
            },
          }),
        }) as never,
      ),
    ).rejects.toThrow("does not match");
  });

  test("batches a scan into one request per page of signatures", async () => {
    const signature = "1".repeat(88);
    const base = connection();
    let transactionCalls = 0;
    let statusCalls = 0;

    const receipts = await readTipReceipts(
      [signature, signature],
      connection({
        getParsedTransactions: async (signatures: string[]) => {
          transactionCalls += 1;
          const transaction = await base.getParsedTransaction();
          return signatures.map(() => transaction);
        },
        getSignatureStatuses: async (signatures: string[]) => {
          statusCalls += 1;
          return {
            value: signatures.map(() => ({
              err: null,
              confirmationStatus: "confirmed",
            })),
          };
        },
      }) as never,
    );

    expect(receipts).toHaveLength(2);
    expect(transactionCalls).toBe(1);
    expect(statusCalls).toBe(1);
  });

  test("omits unverifiable signatures from a scan instead of failing it", async () => {
    const good = "1".repeat(88);
    const base = connection();

    const receipts = await readTipReceipts(
      [good, "not-a-signature", "2".repeat(88)],
      connection({
        getParsedTransactions: async (signatures: string[]) => {
          const transaction = await base.getParsedTransaction();
          /* The second valid signature has no transaction: a settled tip and
             an unrelated or missing one must not be conflated. */
          return signatures.map((value) =>
            value === good ? transaction : null,
          );
        },
        getSignatureStatuses: async (signatures: string[]) => ({
          value: signatures.map(() => ({
            err: null,
            confirmationStatus: "confirmed",
          })),
        }),
      }) as never,
    );

    expect(receipts).toHaveLength(1);
    expect(receipts[0].signature).toBe(good);
  });

  test("propagates transport failures rather than reporting no tips", async () => {
    await expect(
      readTipReceipts(
        ["1".repeat(88)],
        connection({
          getParsedTransactions: async () => {
            throw new Error("rpc unavailable");
          },
        }) as never,
      ),
    ).rejects.toThrow("rpc unavailable");
  });
});
