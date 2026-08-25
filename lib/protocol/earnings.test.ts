import { describe, expect, test } from "bun:test";
import { summarizeChainTips, type ChainTipRow } from "./earnings";

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
