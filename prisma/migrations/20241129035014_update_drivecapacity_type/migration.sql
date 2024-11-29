-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'FONT');

-- CreateEnum
CREATE TYPE "CreatorTier" AS ENUM ('STARTER', 'VERIFIED', 'ELITE');

-- CreateEnum
CREATE TYPE "CreatorStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "FlowComponent" ADD COLUMN     "mediaId" TEXT,
ADD COLUMN     "mode" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "hasSeenIntro" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flowComponentId" TEXT,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StellarProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driveCapacity" BIGINT NOT NULL,
    "currentUsage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StellarProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StellarSettings" (
    "id" TEXT NOT NULL,
    "stellarProfileId" TEXT NOT NULL,
    "defaultView" TEXT NOT NULL,
    "sortBy" TEXT NOT NULL,
    "showHidden" BOOLEAN NOT NULL,

    CONSTRAINT "StellarSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StellarFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "stellarProfileId" TEXT NOT NULL,

    CONSTRAINT "StellarFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StellarFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "stellarFolderId" TEXT NOT NULL,

    CONSTRAINT "StellarFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XPProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "customImageUrl" TEXT,
    "creatorTier" "CreatorTier" NOT NULL DEFAULT 'STARTER',
    "creatorStatus" "CreatorStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "totalDownloads" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "designSystemsPublished" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "website" TEXT,
    "twitter" TEXT,
    "github" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignSystemPublication" (
    "id" TEXT NOT NULL,
    "xpProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "previewImageUrl" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "designSystemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignSystemPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationMediaReference" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "originalMediaId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "PublicationMediaReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaItem_profileId_idx" ON "MediaItem"("profileId");

-- CreateIndex
CREATE INDEX "MediaItem_flowComponentId_idx" ON "MediaItem"("flowComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "StellarProfile_profileId_key" ON "StellarProfile"("profileId");

-- CreateIndex
CREATE INDEX "StellarProfile_profileId_idx" ON "StellarProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "StellarSettings_stellarProfileId_key" ON "StellarSettings"("stellarProfileId");

-- CreateIndex
CREATE INDEX "StellarSettings_stellarProfileId_idx" ON "StellarSettings"("stellarProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "StellarFolder_stellarProfileId_key" ON "StellarFolder"("stellarProfileId");

-- CreateIndex
CREATE INDEX "StellarFolder_parentId_idx" ON "StellarFolder"("parentId");

-- CreateIndex
CREATE INDEX "StellarFile_stellarFolderId_idx" ON "StellarFile"("stellarFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "XPProfile_profileId_key" ON "XPProfile"("profileId");

-- CreateIndex
CREATE INDEX "XPProfile_profileId_idx" ON "XPProfile"("profileId");

-- CreateIndex
CREATE INDEX "DesignSystemPublication_xpProfileId_idx" ON "DesignSystemPublication"("xpProfileId");

-- CreateIndex
CREATE INDEX "PublicationMediaReference_publicationId_idx" ON "PublicationMediaReference"("publicationId");

-- CreateIndex
CREATE INDEX "CreatorFollow_followerId_idx" ON "CreatorFollow"("followerId");

-- CreateIndex
CREATE INDEX "CreatorFollow_followingId_idx" ON "CreatorFollow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorFollow_followerId_followingId_key" ON "CreatorFollow"("followerId", "followingId");
