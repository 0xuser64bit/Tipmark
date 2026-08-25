import { indexProtocolTips, resetProtocolIndex } from "@/lib/protocol/indexer";

if (process.env.TIPMARK_INDEXER_RESET === "true") {
  await resetProtocolIndex();
}

const result = await indexProtocolTips({
  mode:
    process.env.TIPMARK_INDEXER_MODE === "backfill"
      ? "backfill"
      : "incremental",
  pages: Number(process.env.TIPMARK_INDEXER_PAGES || 1),
  pageSize: Number(process.env.TIPMARK_INDEXER_PAGE_SIZE || 100),
});

console.log(JSON.stringify(result));
