-- Prevent duplicate cache rows for the same canonical Solana signature.
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "hash"
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS row_number
  FROM "Transaction"
)
DELETE FROM "Transaction"
USING ranked
WHERE "Transaction"."id" = ranked."id"
  AND ranked.row_number > 1;

CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");
