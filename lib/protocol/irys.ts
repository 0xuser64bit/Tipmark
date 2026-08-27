"use client";

import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";
import type { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";
import { getBase58Encoder } from "@solana/kit";
import { BRAND_NAME } from "@/lib/brand";
import { getSolanaNetworkConfig } from "@/lib/solana/cluster";
import {
  canonicalizeProfileMetadata,
  hashProfileMetadata,
  type ProfileMetadata,
} from "./metadata";

const MAX_PROFILE_IMAGE_BYTES = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** An Irys data-item ID is a 32-byte SHA-256 of the item's signature. */
const RECEIPT_ID_BYTES = 32;

type IrysClient = Awaited<ReturnType<ReturnType<typeof WebUploader>["build"]>>;

type IrysTags = { name: string; value: string }[];

export interface IrysUploadQuote {
  priceAtomic: bigint;
  balanceAtomic: bigint;
  fundingRequiredAtomic: bigint;
}

export interface PermanentProfileUpload {
  metadataUri: string;
  metadataHash: Uint8Array;
  metadata: ProfileMetadata;
}

export class PermanentUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentUploadError";
  }
}

function commonTags(owner: string, type: string): IrysTags {
  return [
    { name: "App-Name", value: BRAND_NAME },
    { name: "App-Version", value: "1" },
    { name: "Tipmark-Owner", value: owner },
    { name: "Tipmark-Type", value: type },
  ];
}

/**
 * Check that an upload receipt names a real data item.
 *
 * The ID is a 32-byte digest, but its text encoding is the SDK's choice:
 * `@irys/bundles` currently returns base58 (43-44 characters), while receipts
 * and Arweave tooling elsewhere use base64url (43 characters). Validate the
 * decoded length rather than one alphabet, so a permanent upload is never
 * discarded over a representation detail — the previous base64url-only check
 * rejected every real base58 ID.
 */
export function assertReceiptId(id: unknown): asserts id is string {
  if (typeof id !== "string" || !id) {
    throw new PermanentUploadError("Irys did not return a transaction ID.");
  }

  for (const decode of [decodeBase58, decodeBase64Url]) {
    if (decode(id) === RECEIPT_ID_BYTES) return;
  }

  throw new PermanentUploadError("Irys returned an invalid transaction ID.");
}

function decodeBase58(value: string): number | null {
  try {
    return getBase58Encoder().encode(value).length;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string): number | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    return Buffer.from(value, "base64url").length;
  } catch {
    return null;
  }
}

export async function createIrysClient(
  wallet: MessageSignerWalletAdapter,
): Promise<IrysClient> {
  if (!wallet.publicKey || !wallet.signMessage) {
    throw new PermanentUploadError(
      "The connected wallet must support message signing for permanent uploads.",
    );
  }

  const network = getSolanaNetworkConfig();
  if (network.cluster !== "devnet") {
    throw new PermanentUploadError(
      "Permanent uploads are supported on Solana Devnet only.",
    );
  }

  const builder = WebUploader(WebSolana)
    .withProvider(wallet)
    .withRpc(network.rpcUrl)
    .timeout(30_000);

  return builder.devnet().build();
}

export function validatePermanentImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new PermanentUploadError("Use a JPEG, PNG, or WebP image.");
  }
  if (file.size <= 0 || file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new PermanentUploadError("Images must be between 1 byte and 1 MB.");
  }
}

export async function quoteIrysUpload(
  irys: Pick<IrysClient, "getPrice" | "getBalance">,
  items: { bytes: number; tags: IrysTags }[],
): Promise<IrysUploadQuote> {
  const prices = await Promise.all(
    items.map((item) => irys.getPrice(item.bytes, { tags: item.tags })),
  );
  const priceAtomic = prices.reduce(
    (total, price) => total + BigInt(price.toFixed(0)),
    0n,
  );
  const balanceAtomic = BigInt((await irys.getBalance()).toFixed(0));

  return {
    priceAtomic,
    balanceAtomic,
    fundingRequiredAtomic:
      priceAtomic > balanceAtomic ? priceAtomic - balanceAtomic : 0n,
  };
}

export async function fundIrysUpload(
  irys: Pick<IrysClient, "fund">,
  amountAtomic: bigint,
): Promise<void> {
  if (amountAtomic <= 0n) return;
  const receipt = await irys.fund(amountAtomic.toString());
  if (!receipt.id) {
    throw new PermanentUploadError("Irys funding was not confirmed.");
  }
}

/** Irys answers an underfunded upload with a 402 rather than a typed error. */
function isPaymentRequired(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("402") || /not enough balance/i.test(error.message))
  );
}

/**
 * Upload, paying only if Irys asks to be paid.
 *
 * Irys serves small uploads free — profile metadata is a few hundred bytes and
 * always is — so quoting and funding up front charged the creator SOL and a
 * confirmation wait for nothing, on a funding transaction that is itself the
 * least reliable step in the flow. Attempt the upload first and fund only when
 * a 402 says it is genuinely required, then retry exactly once.
 */
export async function uploadWithFunding<T>(
  irys: Pick<IrysClient, "getPrice" | "getBalance" | "fund">,
  attempt: () => Promise<T>,
  quote: { bytes: number; tags: IrysTags },
): Promise<T> {
  try {
    return await attempt();
  } catch (error) {
    if (!isPaymentRequired(error)) throw error;

    const { fundingRequiredAtomic } = await quoteIrysUpload(irys, [quote]);
    if (fundingRequiredAtomic <= 0n) {
      /* Irys wants payment but the quote says the balance covers it: retrying
         would loop, so surface the original refusal. */
      throw error;
    }
    await fundIrysUpload(irys, fundingRequiredAtomic);
    return attempt();
  }
}

export function profileImageTags(
  owner: string,
  kind: "avatar" | "cover",
): IrysTags {
  return commonTags(
    owner,
    kind === "avatar" ? "Profile-Avatar" : "Profile-Cover",
  );
}

export function profileMetadataTags(owner: string): IrysTags {
  return [
    ...commonTags(owner, "Profile-Metadata"),
    { name: "Content-Type", value: "application/json" },
  ];
}

export async function uploadPermanentImage(
  irys: Pick<IrysClient, "uploadFile" | "getPrice" | "getBalance" | "fund">,
  file: File,
  owner: string,
  kind: "avatar" | "cover",
): Promise<string> {
  validatePermanentImage(file);
  const tags = profileImageTags(owner, kind);
  const receipt = await uploadWithFunding(
    irys,
    () => irys.uploadFile(file, { tags }),
    { bytes: file.size, tags },
  );
  assertReceiptId(receipt.id);
  if (!(await receipt.verify())) {
    throw new PermanentUploadError("Irys could not verify the image receipt.");
  }
  return `ar://${receipt.id}`;
}

export async function uploadPermanentMetadata(
  irys: Pick<IrysClient, "upload" | "getPrice" | "getBalance" | "fund">,
  metadata: ProfileMetadata,
  owner: string,
): Promise<PermanentProfileUpload> {
  const body = canonicalizeProfileMetadata(metadata);
  const tags = profileMetadataTags(owner);
  const receipt = await uploadWithFunding(
    irys,
    () => irys.upload(body, { tags }),
    { bytes: new TextEncoder().encode(body).byteLength, tags },
  );
  assertReceiptId(receipt.id);
  if (!(await receipt.verify())) {
    throw new PermanentUploadError(
      "Irys could not verify the metadata receipt.",
    );
  }

  return {
    metadataUri: `ar://${receipt.id}`,
    metadataHash: await hashProfileMetadata(metadata),
    metadata,
  };
}
