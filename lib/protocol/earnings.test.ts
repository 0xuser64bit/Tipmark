import { describe, expect, test } from "bun:test";
import { address, getBase58Decoder } from "@solana/kit";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getTipInstructionDataEncoder,
  getTipReceivedEventEncoder,
  TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
} from "@/clients/tipmark-protocol/src";
import {
  scanTipReceipts,
  summarizeChainTips,
  type ChainTipRow,
} from "./earnings";

describe("chain-derived earnings", () => {
  test("summarizes verified tips without database fields", () => {
    const now = new Date();
    const rows: ChainTipRow[] = [
      {
        signature: "a",
        amountLamports: 1_000_000_000n,
        amount: 1,
        fromPublicKey: "supporter-a",
        toPublicKey: "payout",
        status: "confirmed",
        createdAt: now,
      },
      {
        signature: "b",
        amountLamports: 500_000_000n,
        amount: 0.5,
        fromPublicKey: "supporter-a",
        toPublicKey: "payout",
        status: "finalized",
        createdAt: now,
      },
    ];
    const summary = summarizeChainTips(rows);
    expect(summary.total).toBe(1.5);
    expect(summary.contributions).toBe(2);
    expect(summary.supporters).toBe(1);
    expect(summary.largest).toBe(1);
    expect(summary.rows[0]).not.toHaveProperty("amountLamports");
  });
});

const supporter = new PublicKey("Vote111111111111111111111111111111111111111");
const payout = new PublicKey("11111111111111111111111111111111");
const owner = new PublicKey("Config1111111111111111111111111111111111111");
const protocol = new PublicKey(TIPMARK_PROTOCOL_PROGRAM_ADDRESS);
const [profile] = PublicKey.findProgramAddressSync(
  [Buffer.from("profile"), owner.toBuffer()],
  protocol,
);
const reference = Uint8Array.from({ length: 32 }, (_, index) => index + 1);

function tipTransaction() {
  const event = getTipReceivedEventEncoder().encode({
    profile: address(profile.toBase58()),
    profileOwner: address(owner.toBase58()),
    supporter: address(supporter.toBase58()),
    payoutWallet: address(payout.toBase58()),
    amount: 1234n,
    reference,
    timestamp: 100n,
  });
  const eventLog = `Program data: ${Buffer.from(
    Uint8Array.from(event as unknown as ArrayLike<number>),
  ).toString("base64")}`;
  const tipData = getTipInstructionDataEncoder().encode({
    amount: 1234n,
    reference,
  });

  return {
    blockTime: 100,
    meta: {
      err: null,
      logMessages: [
        `Program ${protocol.toBase58()} invoke [1]`,
        eventLog,
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
  };
}

describe("scanning a profile for contributions", () => {
  test("walks pages and batches the transactions in each", async () => {
    const transaction = tipTransaction();
    const pages = [
      [
        { signature: "1".repeat(88), err: null },
        { signature: "1".repeat(88), err: null },
      ],
      [{ signature: "1".repeat(88), err: null }],
    ];
    let pageCalls = 0;
    let batchCalls = 0;

    const rows = await scanTipReceipts(profile.toBase58(), {
      pageSize: 2,
      connection: {
        getSignaturesForAddress: async () => pages[pageCalls++] ?? [],
        getParsedTransactions: async (signatures: string[]) => {
          batchCalls += 1;
          return signatures.map(() => transaction);
        },
        getSignatureStatuses: async (signatures: string[]) => ({
          value: signatures.map(() => ({
            err: null,
            confirmationStatus: "confirmed",
          })),
        }),
      } as never,
    });

    /* Two full pages of signatures, but only one batched fetch per page —
       not one round trip per contribution. */
    expect(rows).toHaveLength(3);
    expect(pageCalls).toBe(2);
    expect(batchCalls).toBe(2);
    expect(rows[0].amountLamports).toBe(1234n);
  });

  test("stops at the page limit rather than scanning without bound", async () => {
    const transaction = tipTransaction();
    let pageCalls = 0;

    await scanTipReceipts(profile.toBase58(), {
      pageSize: 1,
      maxPages: 3,
      connection: {
        getSignaturesForAddress: async () => {
          pageCalls += 1;
          return [{ signature: "1".repeat(88), err: null }];
        },
        getParsedTransactions: async (signatures: string[]) =>
          signatures.map(() => transaction),
        getSignatureStatuses: async (signatures: string[]) => ({
          value: signatures.map(() => ({
            err: null,
            confirmationStatus: "confirmed",
          })),
        }),
      } as never,
    });

    expect(pageCalls).toBe(3);
  });

  test("ignores tips emitted for a different profile", async () => {
    const transaction = tipTransaction();
    const other = new PublicKey("Sysvar1111111111111111111111111111111111111");

    const rows = await scanTipReceipts(other.toBase58(), {
      pageSize: 1,
      maxPages: 1,
      connection: {
        getSignaturesForAddress: async () => [
          { signature: "1".repeat(88), err: null },
        ],
        getParsedTransactions: async (signatures: string[]) =>
          signatures.map(() => transaction),
        getSignatureStatuses: async (signatures: string[]) => ({
          value: signatures.map(() => ({
            err: null,
            confirmationStatus: "confirmed",
          })),
        }),
      } as never,
    });

    expect(rows).toHaveLength(0);
  });

  test("skips failed signatures without fetching them", async () => {
    const transaction = tipTransaction();
    let requested: string[] = [];

    await scanTipReceipts(profile.toBase58(), {
      pageSize: 2,
      maxPages: 1,
      connection: {
        getSignaturesForAddress: async () => [
          { signature: "1".repeat(88), err: null },
          { signature: "2".repeat(88), err: { InstructionError: [0, {}] } },
        ],
        getParsedTransactions: async (signatures: string[]) => {
          requested = signatures;
          return signatures.map(() => transaction);
        },
        getSignatureStatuses: async (signatures: string[]) => ({
          value: signatures.map(() => ({
            err: null,
            confirmationStatus: "confirmed",
          })),
        }),
      } as never,
    });

    expect(requested).toEqual(["1".repeat(88)]);
  });
});
