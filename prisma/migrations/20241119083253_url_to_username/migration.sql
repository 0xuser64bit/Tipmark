/*
  Warnings:

  - You are about to drop the column `github_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `instagram_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `x_url` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "github_url",
DROP COLUMN "instagram_url",
DROP COLUMN "linkedin_url",
DROP COLUMN "x_url",
ADD COLUMN     "github_username" TEXT,
ADD COLUMN     "instagram_username" TEXT,
ADD COLUMN     "linkedin_username" TEXT,
ADD COLUMN     "x_username" TEXT;
