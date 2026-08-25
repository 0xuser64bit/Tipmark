CREATE TABLE "WalletChallenge" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "email" TEXT,
    "domain" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "cluster" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WalletChallenge_nonce_key" ON "WalletChallenge"("nonce");
CREATE INDEX "WalletChallenge_wallet_expiresAt_idx" ON "WalletChallenge"("wallet", "expiresAt");
