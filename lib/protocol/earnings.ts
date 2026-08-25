import { PublicKey, Connection } from "@solana/web3.js";
import { getProtocolConfig } from "./config";
import { deriveProfilePda } from "./pdas";
import { lamportsToSol } from "@/lib/solana/amount";
import { readTipReceipt, type VerifiedTipReceipt } from "./tip-receipt";

export interface ChainTipRow {
  signature: string;
  amountLamports: bigint;
  amount: number;
  fromPublicKey: string;
  toPublicKey: string;
  status: string;
  createdAt: Date;
}

const DAY = 86_400_000;

/** Scan profile-address signatures and keep only verified protocol tips. */
export async function scanTipReceipts(
  profileAddress: string,
  options: {
    connection?: Connection;
    maxPages?: number;
    pageSize?: number;
  } = {},
): Promise<ChainTipRow[]> {
  const connection =
    options.connection ||
    new Connection(getProtocolConfig().rpcUrl, "confirmed");
  const profile = new PublicKey(profileAddress);
  const rows: ChainTipRow[] = [];
  let before: string | undefined;
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 10, 100));
  const pageSize = Math.max(1, Math.min(options.pageSize ?? 1000, 1000));

  for (let page = 0; page < maxPages; page += 1) {
    const signatures = await connection.getSignaturesForAddress(profile, {
      before,
      limit: pageSize,
    });
    if (!signatures.length) break;

    for (const item of signatures) {
      if (item.err) continue;
      try {
        const receipt = await readTipReceipt(item.signature, connection);
        if (String(receipt.event.profile) !== profile.toBase58()) continue;
        rows.push(toTipRow(receipt));
      } catch {
        // Profile signatures can include unrelated instructions; ignore them.
      }
    }

    if (signatures.length < pageSize) break;
    before = signatures[signatures.length - 1].signature;
  }

  return rows;
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
    rows: rows.map(({ amountLamports: _amountLamports, ...row }) => row),
  };
}

export async function scanProfileTipsByOwner(
  owner: string,
  options: {
    connection?: Connection;
    maxPages?: number;
    pageSize?: number;
  } = {},
) {
  const [profile] = await deriveProfilePda(owner);
  return scanTipReceipts(profile, options);
}
