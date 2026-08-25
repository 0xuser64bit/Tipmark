import db from "@/db";
import { PublicKey, type Connection } from "@solana/web3.js";
import {
  NonRetryableRpcReadError,
  readWithRpcFailover,
} from "@/lib/solana/rpc";
import { getProtocolConfig } from "./config";
import { encodeTipReference } from "./reference";
import {
  readTipReceipt,
  TipReceiptVerificationError,
  type VerifiedTipReceipt,
} from "./tip-receipt";

const DEFAULT_PAGE_SIZE = 100;
const MAX_CHECKPOINT_ATTEMPTS = 3;

class ProtocolIndexerCheckpointConflict extends NonRetryableRpcReadError {
  constructor() {
    super("The protocol index checkpoint changed during this run.");
    this.name = "ProtocolIndexerCheckpointConflict";
  }
}

export interface IndexProtocolTipsOptions {
  mode?: "incremental" | "backfill";
  pages?: number;
  pageSize?: number;
  connection?: Connection;
}

export interface IndexProtocolTipsResult {
  mode: "incremental" | "backfill";
  scanned: number;
  verified: number;
  skipped: number;
  headSlot: number;
  headSignature: string | null;
  backfillBefore: string | null;
  backfillComplete: boolean;
}

type SignatureRow = Awaited<
  ReturnType<Connection["getSignaturesForAddress"]>
>[number];

export interface IndexCheckpointState {
  headSlot: bigint;
  headSignature: string | null;
  backfillBefore: string | null;
  backfillComplete: boolean;
}

function checkpointId(cluster: string, program: string): string {
  return `${cluster}:${program}`;
}

export function planCheckpointUpdate(
  checkpoint: IndexCheckpointState,
  mode: "incremental" | "backfill",
  rows: Pick<SignatureRow, "signature" | "slot">[],
  reachedEnd: boolean,
) {
  const newest = rows[0];
  const oldest = rows[rows.length - 1];
  return mode === "incremental"
    ? {
        headSlot: newest ? BigInt(newest.slot) : checkpoint.headSlot,
        headSignature: newest?.signature || checkpoint.headSignature,
        backfillBefore:
          checkpoint.headSignature === null
            ? oldest?.signature || checkpoint.backfillBefore
            : checkpoint.backfillBefore,
        backfillComplete:
          checkpoint.headSignature === null
            ? reachedEnd
            : checkpoint.backfillComplete,
      }
    : {
        backfillBefore: oldest?.signature || checkpoint.backfillBefore,
        backfillComplete: reachedEnd,
      };
}

function copyReference(value: {
  readonly [index: number]: number;
  length?: number;
}): Uint8Array {
  const bytes = new Uint8Array(value.length ?? 0);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = value[i];
  return bytes;
}

async function persistTip(
  receipt: VerifiedTipReceipt,
  slot: number,
  cluster: string,
  program: string,
): Promise<void> {
  const data = {
    cluster,
    program,
    profile: String(receipt.event.profile),
    profileOwner: String(receipt.event.profileOwner),
    supporter: String(receipt.event.supporter),
    payoutWallet: String(receipt.event.payoutWallet),
    amountLamports: receipt.event.amount.toString(),
    reference: encodeTipReference(
      copyReference(
        receipt.event.reference as unknown as {
          readonly [index: number]: number;
          length?: number;
        },
      ),
    ),
    slot: BigInt(slot),
    blockTime: receipt.blockTime,
    status: receipt.status,
    verifiedAt: new Date(),
  };
  await db.protocolTip.upsert({
    where: { signature: receipt.signature },
    update: data,
    create: { signature: receipt.signature, ...data },
  });
}

export async function fetchProtocolSignaturePages(input: {
  program: PublicKey;
  before?: string;
  until?: string;
  pages: number;
  pageSize: number;
  connection: Connection;
}): Promise<{ rows: SignatureRow[]; reachedEnd: boolean }> {
  const rows: SignatureRow[] = [];
  let before = input.before;
  let reachedEnd = false;
  for (let page = 0; page < input.pages; page += 1) {
    const signatures = await input.connection.getSignaturesForAddress(
      input.program,
      {
        before,
        until: input.until,
        limit: input.pageSize,
      },
    );
    if (!signatures.length) {
      reachedEnd = true;
      break;
    }
    rows.push(...signatures);
    before = signatures[signatures.length - 1].signature;
    if (signatures.length < input.pageSize) {
      reachedEnd = true;
      break;
    }
  }
  return { rows, reachedEnd };
}

async function indexProtocolTipsOnce(
  options: IndexProtocolTipsOptions = {},
): Promise<IndexProtocolTipsResult> {
  const config = getProtocolConfig();
  const program = new PublicKey(config.programAddress);
  const connection = options.connection;
  if (!connection) {
    throw new Error("An indexer connection is required for a single RPC run.");
  }
  const mode = options.mode || "incremental";
  const pages = Math.max(1, Math.min(options.pages ?? 1, 100));
  const pageSize = Math.max(
    1,
    Math.min(options.pageSize ?? DEFAULT_PAGE_SIZE, 1000),
  );
  const id = checkpointId(config.cluster, config.programAddress);
  const checkpoint = await db.protocolIndexerCheckpoint.upsert({
    where: { id },
    update: {},
    create: { id, cluster: config.cluster, program: config.programAddress },
  });
  if (mode === "backfill" && checkpoint.backfillComplete) {
    return {
      mode,
      scanned: 0,
      verified: 0,
      skipped: 0,
      headSlot: Number(checkpoint.headSlot),
      headSignature: checkpoint.headSignature,
      backfillBefore: checkpoint.backfillBefore,
      backfillComplete: true,
    };
  }

  const page = await fetchProtocolSignaturePages({
    program,
    pages,
    pageSize,
    connection,
    until:
      mode === "incremental"
        ? checkpoint.headSignature || undefined
        : undefined,
    before:
      mode === "backfill"
        ? checkpoint.backfillBefore || checkpoint.headSignature || undefined
        : undefined,
  });
  let verified = 0;
  let skipped = 0;
  for (const item of [...page.rows].reverse()) {
    if (item.err) {
      skipped += 1;
      continue;
    }
    try {
      const receipt = await readTipReceipt(item.signature, connection);
      await persistTip(
        receipt,
        item.slot,
        config.cluster,
        config.programAddress,
      );
      verified += 1;
    } catch (error) {
      if (!(error instanceof TipReceiptVerificationError)) throw error;
      skipped += 1;
    }
  }

  const data = planCheckpointUpdate(
    checkpoint,
    mode,
    page.rows,
    page.reachedEnd,
  );
  const committed = await db.protocolIndexerCheckpoint.updateMany({
    where: { id, revision: checkpoint.revision },
    data: { ...data, revision: { increment: 1 } },
  });
  if (committed.count !== 1) {
    throw new ProtocolIndexerCheckpointConflict();
  }
  const updated = await db.protocolIndexerCheckpoint.findUniqueOrThrow({
    where: { id },
  });

  return {
    mode,
    scanned: page.rows.length,
    verified,
    skipped,
    headSlot: Number(updated.headSlot),
    headSignature: updated.headSignature,
    backfillBefore: updated.backfillBefore,
    backfillComplete: updated.backfillComplete,
  };
}

/** Replay verified protocol signatures into a disposable PostgreSQL cache. */
export async function indexProtocolTips(
  options: IndexProtocolTipsOptions = {},
): Promise<IndexProtocolTipsResult> {
  for (let attempt = 0; attempt < MAX_CHECKPOINT_ATTEMPTS; attempt += 1) {
    try {
      const run = (connection: Connection) =>
        indexProtocolTipsOnce({ ...options, connection });
      return options.connection
        ? await run(options.connection)
        : await readWithRpcFailover((connection) => run(connection));
    } catch (error) {
      if (
        !(error instanceof ProtocolIndexerCheckpointConflict) ||
        attempt + 1 === MAX_CHECKPOINT_ATTEMPTS
      ) {
        throw error;
      }
    }
  }
  throw new ProtocolIndexerCheckpointConflict();
}

export async function resetProtocolIndex(): Promise<void> {
  const config = getProtocolConfig();
  const id = checkpointId(config.cluster, config.programAddress);
  await db.$transaction([
    db.protocolTip.deleteMany({
      where: { cluster: config.cluster, program: config.programAddress },
    }),
    db.protocolIndexerCheckpoint.deleteMany({ where: { id } }),
  ]);
}

/** Re-verify cached rows and repair or remove anything that diverged. */
async function reconcileProtocolTipsOnce(
  connection: Connection,
  options: { limit?: number } = {},
): Promise<{ checked: number; repaired: number; removed: number }> {
  const config = getProtocolConfig();
  const rows = await db.protocolTip.findMany({
    where: { cluster: config.cluster, program: config.programAddress },
    orderBy: { slot: "asc" },
    take: Math.max(1, Math.min(options.limit ?? 500, 5_000)),
  });
  let repaired = 0;
  let removed = 0;
  for (const row of rows) {
    try {
      const receipt = await readTipReceipt(row.signature, connection);
      const differs =
        row.profile !== String(receipt.event.profile) ||
        row.profileOwner !== String(receipt.event.profileOwner) ||
        row.supporter !== String(receipt.event.supporter) ||
        row.payoutWallet !== String(receipt.event.payoutWallet) ||
        row.amountLamports !== receipt.event.amount.toString();
      if (differs) {
        await persistTip(
          receipt,
          Number(row.slot),
          config.cluster,
          config.programAddress,
        );
        repaired += 1;
      }
    } catch (error) {
      if (!(error instanceof TipReceiptVerificationError)) throw error;
      await db.protocolTip.delete({ where: { signature: row.signature } });
      removed += 1;
    }
  }
  return { checked: rows.length, repaired, removed };
}

export async function reconcileProtocolTips(
  options: { limit?: number; connection?: Connection } = {},
): Promise<{ checked: number; repaired: number; removed: number }> {
  if (options.connection) {
    return reconcileProtocolTipsOnce(options.connection, options);
  }
  return readWithRpcFailover((connection) =>
    reconcileProtocolTipsOnce(connection, options),
  );
}
