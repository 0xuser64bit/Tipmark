CREATE TABLE "ProtocolTip" (
    "signature" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "profileOwner" TEXT NOT NULL,
    "supporter" TEXT NOT NULL,
    "payoutWallet" TEXT NOT NULL,
    "amountLamports" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,
    "blockTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtocolTip_pkey" PRIMARY KEY ("signature")
);

CREATE INDEX "ProtocolTip_cluster_program_profile_slot_idx"
  ON "ProtocolTip"("cluster", "program", "profile", "slot");
CREATE INDEX "ProtocolTip_profileOwner_slot_idx"
  ON "ProtocolTip"("profileOwner", "slot");

CREATE TABLE "ProtocolIndexerCheckpoint" (
    "id" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "headSlot" BIGINT NOT NULL DEFAULT 0,
    "headSignature" TEXT,
    "backfillBefore" TEXT,
    "backfillComplete" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtocolIndexerCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProtocolIndexerCheckpoint_cluster_program_key"
  ON "ProtocolIndexerCheckpoint"("cluster", "program");
