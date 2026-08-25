import { describe, expect, test } from "bun:test";
import { fetchProtocolSignaturePages, planCheckpointUpdate } from "./indexer";

const empty = {
  headSlot: 0n,
  headSignature: null,
  backfillBefore: null,
  backfillComplete: false,
};

describe("protocol index checkpoints", () => {
  test("records a new head and separate historical cursor", () => {
    expect(
      planCheckpointUpdate(
        empty,
        "incremental",
        [
          { signature: "newest", slot: 20 },
          { signature: "oldest", slot: 10 },
        ],
        false,
      ),
    ).toEqual({
      headSlot: 20n,
      headSignature: "newest",
      backfillBefore: "oldest",
      backfillComplete: false,
    });
  });

  test("incremental updates do not move the backfill cursor", () => {
    expect(
      planCheckpointUpdate(
        {
          headSlot: 20n,
          headSignature: "head",
          backfillBefore: "history",
          backfillComplete: false,
        },
        "incremental",
        [{ signature: "new-head", slot: 30 }],
        true,
      ),
    ).toEqual({
      headSlot: 30n,
      headSignature: "new-head",
      backfillBefore: "history",
      backfillComplete: false,
    });
  });

  test("backfill advances only its historical cursor", () => {
    expect(
      planCheckpointUpdate(
        {
          headSlot: 20n,
          headSignature: "head",
          backfillBefore: "history",
          backfillComplete: false,
        },
        "backfill",
        [{ signature: "older", slot: 5 }],
        true,
      ),
    ).toEqual({ backfillBefore: "older", backfillComplete: true });
  });

  test("paginates all pages on the supplied RPC connection", async () => {
    const calls: unknown[] = [];
    const connection = {
      getSignaturesForAddress: async (_program: unknown, options: unknown) => {
        calls.push({ connection, options });
        return calls.length === 1
          ? [
              { signature: "newest", slot: 20, err: null },
              { signature: "middle", slot: 15, err: null },
            ]
          : [{ signature: "oldest", slot: 10, err: null }];
      },
    };

    const result = await fetchProtocolSignaturePages({
      program: {} as never,
      pages: 2,
      pageSize: 2,
      connection: connection as never,
    });

    expect(result.rows.map((row) => row.signature)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({
      options: { before: undefined, limit: 2 },
    });
    expect(calls[1]).toMatchObject({
      options: { before: "middle", limit: 2 },
    });
    expect(
      calls.every(
        (call) => (call as { connection: unknown }).connection === connection,
      ),
    ).toBe(true);
  });
});
