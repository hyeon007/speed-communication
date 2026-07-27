-- CreateEnum
CREATE TYPE "public"."DeviceBrand" AS ENUM ('apple', 'samsung');

-- CreateEnum
CREATE TYPE "public"."DevicePublicationStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "public"."devices" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" "public"."DeviceBrand" NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "colors" TEXT[] NOT NULL,
    "storageOptions" TEXT[] NOT NULL,
    "highlights" TEXT[] NOT NULL,
    "status" "public"."DevicePublicationStatus" NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_slug_key" ON "public"."devices"("slug");

-- CreateIndex
CREATE INDEX "devices_status_sortOrder_idx" ON "public"."devices"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "devices_brand_status_sortOrder_idx" ON "public"."devices"("brand", "status", "sortOrder");
