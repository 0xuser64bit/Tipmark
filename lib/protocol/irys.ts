"use client";

import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";
import type { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";
import { BRAND_NAME } from "@/lib/brand";
import { getSolanaNetworkConfig } from "@/lib/solana/cluster";
import {
  canonicalizeProfileMetadata,
  hashProfileMetadata,
  type ProfileMetadata,
} from "./metadata";

const MAX_PROFILE_IMAGE_BYTES = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function assertReceiptId(id: string): void {
  if (!/^[A-Za-z0-9_-]{43}$/.test(id)) {
    throw new PermanentUploadError("Irys returned an invalid transaction ID.");
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
  irys: Pick<IrysClient, "uploadFile">,
  file: File,
  owner: string,
  kind: "avatar" | "cover",
): Promise<string> {
  validatePermanentImage(file);
  const receipt = await irys.uploadFile(file, {
    tags: profileImageTags(owner, kind),
  });
  assertReceiptId(receipt.id);
  if (!(await receipt.verify())) {
    throw new PermanentUploadError("Irys could not verify the image receipt.");
  }
  return `ar://${receipt.id}`;
}

export async function uploadPermanentMetadata(
  irys: Pick<IrysClient, "upload">,
  metadata: ProfileMetadata,
  owner: string,
): Promise<PermanentProfileUpload> {
  const body = canonicalizeProfileMetadata(metadata);
  const receipt = await irys.upload(body, {
    tags: profileMetadataTags(owner),
  });
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
