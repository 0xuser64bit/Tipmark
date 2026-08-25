import { reconcileProtocolTips } from "@/lib/protocol/indexer";

const result = await reconcileProtocolTips({
  limit: Number(process.env.TIPMARK_RECONCILE_LIMIT || 500),
});

console.log(JSON.stringify(result));
