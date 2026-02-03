-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('YOUTUBE_CONTENT', 'DOCUMENT_CONTENT');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessingStep" AS ENUM ('TRANSCRIPT', 'EMBEDDINGS');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255),
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Space" (
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("space_id")
);

-- CreateTable
CREATE TABLE "Content" (
    "content_id" TEXT NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("content_id")
);

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
CREATE TABLE "YoutubeContent" (
    "content_id" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "transcript" JSONB NOT NULL,
    "youtube_url" TEXT NOT NULL,

    CONSTRAINT "YoutubeContent_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "DocumentContent" (
    "content_id" TEXT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "doc_id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "DocumentContent_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "ContentMetadata" (
    "content_id" TEXT NOT NULL,
    "summary" TEXT,
    "flashcards" JSONB,
    "mindmap" JSONB,
    "quiz" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentMetadata_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "ContentProcessingJob" (
    "job_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "step" "ProcessingStep" NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentProcessingJob_pkey" PRIMARY KEY ("job_id")
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeContent_youtube_id_key" ON "YoutubeContent"("youtube_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentContent_doc_id_key" ON "DocumentContent"("doc_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentContent_hash_key" ON "DocumentContent"("hash");

-- CreateIndex
CREATE INDEX "ContentProcessingJob_content_id_status_idx" ON "ContentProcessingJob"("content_id", "status");

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
ALTER TABLE "ContentMetadata" ADD CONSTRAINT "ContentMetadata_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProcessingJob" ADD CONSTRAINT "ContentProcessingJob_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

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
