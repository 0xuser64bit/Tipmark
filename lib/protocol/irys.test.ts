import { describe, expect, test } from "bun:test";
import {
  assertReceiptId,
  fundIrysUpload,
  profileMetadataTags,
  quoteIrysUpload,
  uploadPermanentMetadata,
  uploadWithFunding,
  validatePermanentImage,
} from "./irys";
import { normalizeProfileMetadata } from "./metadata";

const decimal = (value: bigint) => ({ toFixed: () => value.toString() });

/** A real ID returned by devnet.irys.xyz: base58, 44 characters. */
const IRYS_ID = "G4yv1pxytvwDW2UKB1iPAF1CzJ4oAZU9orZhykN1tJ52";

/**
 * A client that quotes a price above its balance. Used to prove the funding
 * path is reached only when Irys actually refuses an upload.
 */
function fundingClient<T extends Record<string, unknown>>(overrides?: T) {
  return {
    getPrice: async () => decimal(100n) as never,
    getBalance: async () => decimal(0n) as never,
    fund: async () => ({ id: "fund-tx" }) as never,
    upload: async () => ({ id: IRYS_ID, verify: async () => true }) as never,
    uploadFile: async () =>
      ({ id: IRYS_ID, verify: async () => true }) as never,
    ...(overrides ?? ({} as T)),
  };
}

describe("wallet-owned permanent uploads", () => {
  test("quotes only the funding deficit", async () => {
    const quote = await quoteIrysUpload(
      {
        getPrice: async (bytes: number) => decimal(BigInt(bytes * 2)) as never,
        getBalance: async () => decimal(50n) as never,
      },
      [
        { bytes: 20, tags: [] },
        { bytes: 30, tags: [] },
      ],
    );

    expect(quote.priceAtomic).toBe(100n);
    expect(quote.balanceAtomic).toBe(50n);
    expect(quote.fundingRequiredAtomic).toBe(50n);
  });

  test("does not request a funding transaction when balance is sufficient", async () => {
    let funded = false;
    await fundIrysUpload(
      {
        fund: async () => {
          funded = true;
          return { id: "unused" } as never;
        },
      },
      0n,
    );
    expect(funded).toBe(false);
  });

  test("validates permanent image formats and limits", () => {
    validatePermanentImage(
      new File([new Uint8Array([1])], "avatar.png", { type: "image/png" }),
    );
    expect(() =>
      validatePermanentImage(
        new File(["<svg/>"], "avatar.svg", { type: "image/svg+xml" }),
      ),
    ).toThrow("JPEG, PNG, or WebP");
  });

  test("uploads canonical metadata with verifiable ownership tags", async () => {
    const metadata = normalizeProfileMetadata({ displayName: "Ada" });
    let uploaded = "";
    const result = await uploadPermanentMetadata(
      fundingClient({
        upload: async (body: string) => {
          uploaded = body;
          return { id: IRYS_ID, verify: async () => true } as never;
        },
      }),
      metadata,
      "owner-wallet",
    );

    expect(JSON.parse(uploaded)).toEqual(metadata);
    expect(result.metadataUri).toBe(`ar://${IRYS_ID}`);
    expect(result.metadataHash).toHaveLength(32);
    expect(profileMetadataTags("owner-wallet")).toContainEqual({
      name: "Tipmark-Owner",
      value: "owner-wallet",
    });
  });

  test("accepts the base58 transaction IDs Irys actually returns", () => {
    /* Regression: the check required 43-character base64url, so every real
       44-character base58 ID was rejected after a successful upload. */
    expect(() => assertReceiptId(IRYS_ID)).not.toThrow();
    expect(() =>
      assertReceiptId("GuFyEyssqFiNSUrV5NYX3ni22kVQEokNgEx4pR3N3SFt"),
    ).not.toThrow();
  });

  test("accepts base64url transaction IDs, which receipts elsewhere use", () => {
    const base64Url = Buffer.from(new Uint8Array(32).fill(7)).toString(
      "base64url",
    );
    expect(() => assertReceiptId(base64Url)).not.toThrow();
  });

  test("rejects anything that does not decode to a 32-byte digest", () => {
    for (const invalid of ["", "short", "z".repeat(200), "!!!not-an-id!!!"]) {
      expect(() => assertReceiptId(invalid)).toThrow(
        /invalid transaction ID|did not return a transaction ID/,
      );
    }
    expect(() => assertReceiptId(undefined)).toThrow(
      "did not return a transaction ID",
    );
  });

  test("uploads without funding when Irys does not ask to be paid", async () => {
    /* Irys serves small uploads free, and profile metadata always is. Quoting
       and funding up front cost the creator SOL and a confirmation wait for
       nothing, on the least reliable step in the flow. */
    let funded = false;
    let attempts = 0;

    await uploadWithFunding(
      fundingClient({
        fund: async () => {
          funded = true;
          return { id: "fund-tx" } as never;
        },
      }),
      async () => {
        attempts += 1;
        return "uploaded";
      },
      { bytes: 200, tags: [] },
    );

    expect(funded).toBe(false);
    expect(attempts).toBe(1);
  });

  test("funds and retries once when Irys answers 402", async () => {
    let funded = 0n;
    let attempts = 0;

    const result = await uploadWithFunding(
      fundingClient({
        fund: async (amount: string) => {
          funded = BigInt(amount);
          return { id: "fund-tx" } as never;
        },
      }),
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error("402 error: Not enough balance for transaction");
        }
        return "uploaded";
      },
      { bytes: 120_000, tags: [] },
    );

    expect(result).toBe("uploaded");
    expect(attempts).toBe(2);
    expect(funded).toBe(100n);
  });

  test("does not fund or retry an unrelated upload failure", async () => {
    let funded = false;
    let attempts = 0;

    await expect(
      uploadWithFunding(
        fundingClient({
          fund: async () => {
            funded = true;
            return { id: "fund-tx" } as never;
          },
        }),
        async () => {
          attempts += 1;
          throw new Error("network unreachable");
        },
        { bytes: 200, tags: [] },
      ),
    ).rejects.toThrow("network unreachable");

    expect(funded).toBe(false);
    expect(attempts).toBe(1);
  });

  test("surfaces the refusal when a funded balance is still rejected", async () => {
    /* Balance already covers the quote but Irys still says 402: funding again
       would loop forever, so report the original refusal. */
    let attempts = 0;

    await expect(
      uploadWithFunding(
        fundingClient({ getBalance: async () => decimal(1_000n) as never }),
        async () => {
          attempts += 1;
          throw new Error("402 error: Not enough balance for transaction");
        },
        { bytes: 200, tags: [] },
      ),
    ).rejects.toThrow("402");

    expect(attempts).toBe(1);
  });
});
