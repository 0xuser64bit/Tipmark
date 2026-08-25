import { describe, expect, test } from "bun:test";
import { planCheckpointUpdate } from "./indexer";

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
});
