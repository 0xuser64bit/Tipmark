import { describe, expect, test } from "bun:test";
import {
  fundIrysUpload,
  profileMetadataTags,
  quoteIrysUpload,
  uploadPermanentMetadata,
  validatePermanentImage,
} from "./irys";
import { normalizeProfileMetadata } from "./metadata";

const decimal = (value: bigint) => ({ toFixed: () => value.toString() });

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
    const id = "a".repeat(43);
    let uploaded = "";
    const result = await uploadPermanentMetadata(
      {
        upload: async (body: string) => {
          uploaded = body;
          return { id, verify: async () => true } as never;
        },
      },
      metadata,
      "owner-wallet",
    );

    expect(JSON.parse(uploaded)).toEqual(metadata);
    expect(result.metadataUri).toBe(`ar://${id}`);
    expect(result.metadataHash).toHaveLength(32);
    expect(profileMetadataTags("owner-wallet")).toContainEqual({
      name: "Tipmark-Owner",
      value: "owner-wallet",
    });
  });
});
