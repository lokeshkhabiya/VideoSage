/*
  Warnings:

  - You are about to drop the `Space_Content` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content_type` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('YOUTUBE_CONTENT', 'DOCUMENT_CONTENT');

-- DropForeignKey
ALTER TABLE "Space_Content" DROP CONSTRAINT "Space_Content_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Space_Content" DROP CONSTRAINT "Space_Content_space_id_fkey";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "space_id" DROP NOT NULL,
DROP COLUMN "content_type",
ADD COLUMN     "content_type" "ContentType" NOT NULL;

-- AlterTable
ALTER TABLE "YoutubeContent" ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "thumbnail_url" SET DATA TYPE TEXT,
ALTER COLUMN "youtube_url" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Space_Content";

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
