-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "description" TEXT,
    "display_name" TEXT,
    "profile_image" TEXT,
    "cover_image" TEXT,
    "x_url" TEXT,
    "instagram_url" TEXT,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "solana_public_key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
