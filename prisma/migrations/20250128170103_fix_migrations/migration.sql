/*
  Warnings:

  - You are about to drop the column `space_id` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Content` table. All the data in the column will be lost.
  - Changed the type of `transcript` on the `YoutubeContent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_space_id_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_user_id_fkey";

-- DropForeignKey
ALTER TABLE "DocumentContent" DROP CONSTRAINT "DocumentContent_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_user_id_fkey";

-- DropForeignKey
ALTER TABLE "YoutubeContent" DROP CONSTRAINT "YoutubeContent_content_id_fkey";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "space_id",
DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "space_name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "YoutubeContent" DROP COLUMN "transcript",
ADD COLUMN     "transcript" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "SpaceContent" (
    "space_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,

    CONSTRAINT "SpaceContent_pkey" PRIMARY KEY ("space_id","content_id")
);

-- CreateTable
CREATE TABLE "UserContent" (
    "user_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,

    CONSTRAINT "UserContent_pkey" PRIMARY KEY ("user_id","content_id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "metadata_id" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "summary" TEXT,
    "flashcards" JSONB,
    "mindmap" JSONB,
    "quiz" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("metadata_id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "chatroom_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("chatroom_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "chatroom_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_youtube_id_key" ON "Metadata"("youtube_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_content_id_user_id_key" ON "ChatRoom"("content_id", "user_id");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceContent" ADD CONSTRAINT "SpaceContent_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "Space"("space_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceContent" ADD CONSTRAINT "SpaceContent_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContent" ADD CONSTRAINT "UserContent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContent" ADD CONSTRAINT "UserContent_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeContent" ADD CONSTRAINT "YoutubeContent_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentContent" ADD CONSTRAINT "DocumentContent_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_youtube_id_fkey" FOREIGN KEY ("youtube_id") REFERENCES "YoutubeContent"("youtube_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatroom_id_fkey" FOREIGN KEY ("chatroom_id") REFERENCES "ChatRoom"("chatroom_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Message"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;
