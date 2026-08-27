import { PublicKey, Connection } from "@solana/web3.js";
import { lamportsToSol } from "@/lib/solana/amount";
import { readTipReceipts, type VerifiedTipReceipt } from "./tip-receipt";
import { readWithRpcFailover } from "@/lib/solana/rpc";
import { deriveProfilePda } from "./pdas";

export interface ChainTipRow {
  signature: string;
  amountLamports: bigint;
  amount: number;
  fromPublicKey: string;
  toPublicKey: string;
  status: string;
  createdAt: Date;
}

export interface ScanTipOptions {
  connection?: Connection;
  /** Signature pages to walk. Each page is one `getSignaturesForAddress` call. */
  maxPages?: number;
  pageSize?: number;
}

const DAY = 86_400_000;

/** Signatures per page. The RPC maximum is 1000. */
const DEFAULT_PAGE_SIZE = 1_000;

/**
 * A bounded default depth: 10 pages is up to 10,000 signatures, well beyond any
 * realistic profile, while keeping a pathological address from scanning
 * unboundedly on a page request.
 */
const DEFAULT_MAX_PAGES = 10;

/**
 * Read a profile's verified contributions from Solana.
 *
 * Signature pages must be walked in order because each page's cursor is the
 * previous page's last signature, but the transactions within a page are
 * fetched as a single batched request rather than one round trip per tip —
 * a profile with 400 contributions costs one page call plus four batches,
 * not 400 sequential lookups.
 *
 * Verification is unchanged: every row is bound to its instruction, event, and
 * inner transfer, so an unrelated instruction in the profile's history is
 * skipped rather than counted.
 */
export async function scanTipReceipts(
  profileAddress: string,
  options: ScanTipOptions = {},
): Promise<ChainTipRow[]> {
  const profile = new PublicKey(profileAddress);
  const maxPages = Math.max(
    1,
    Math.min(options.maxPages ?? DEFAULT_MAX_PAGES, 100),
  );
  const pageSize = Math.max(
    1,
    Math.min(options.pageSize ?? DEFAULT_PAGE_SIZE, 1_000),
  );

  return readWithRpcFailover(async (connection) => {
    const rows: ChainTipRow[] = [];
    let before: string | undefined;

    for (let page = 0; page < maxPages; page += 1) {
      const signatures = await connection.getSignaturesForAddress(profile, {
        before,
        limit: pageSize,
      });
      if (!signatures.length) break;

      const receipts = await readTipReceipts(
        signatures.filter((item) => !item.err).map((item) => item.signature),
        connection,
      );
      for (const receipt of receipts) {
        /* The scan is anchored on the profile address, but an address appears
           in a transaction for many reasons; keep only tips to this profile. */
        if (String(receipt.event.profile) !== profile.toBase58()) continue;
        rows.push(toTipRow(receipt));
      }

      if (signatures.length < pageSize) break;
      before = signatures[signatures.length - 1].signature;
    }

    return rows;
  }, options.connection);
}

function toTipRow(receipt: VerifiedTipReceipt): ChainTipRow {
  return {
    signature: receipt.signature,
    amountLamports: receipt.event.amount,
    amount: Number(lamportsToSol(receipt.event.amount)),
    fromPublicKey: String(receipt.event.supporter),
    toPublicKey: String(receipt.event.payoutWallet),
    status: receipt.status,
    createdAt:
      receipt.blockTime || new Date(Number(receipt.event.timestamp) * 1000),
  };
}

export function summarizeChainTips(rows: ChainTipRow[]) {
  const now = Date.now();
  const sumWithin = (days: number) =>
    rows.reduce(
      (total, row) =>
        now - row.createdAt.getTime() < days * DAY ? total + row.amount : total,
      0,
    );
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (11 - index),
      1,
    );
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear(),
      total: 0,
    };
  });
  const indexOf = new Map(months.map((month, index) => [month.key, index]));
  for (const row of rows) {
    const date = row.createdAt;
    const index = indexOf.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (index !== undefined) months[index].total += row.amount;
  }

  return {
    total: rows.reduce((total, row) => total + row.amount, 0),
    last7: sumWithin(7),
    last30: sumWithin(30),
    contributions: rows.length,
    supporters: new Set(rows.map((row) => row.fromPublicKey)).size,
    largest: rows.reduce((max, row) => Math.max(max, row.amount), 0),
    months: months.map(({ label, year, total }) => ({
      label,
      year,
      total: Number(total.toFixed(6)),
    })),
    /* Lamports are the verified quantity but the UI works in SOL; drop the
       raw value from summary rows so the two cannot disagree downstream. */
    rows: rows.map((row) => ({
      signature: row.signature,
      amount: row.amount,
      fromPublicKey: row.fromPublicKey,
      toPublicKey: row.toPublicKey,
      status: row.status,
      createdAt: row.createdAt,
    })),
  };
}

export async function scanProfileTipsByOwner(
  owner: string,
  options: ScanTipOptions = {},
) {
  const [profile] = await deriveProfilePda(owner);
  return scanTipReceipts(profile, options);
}
