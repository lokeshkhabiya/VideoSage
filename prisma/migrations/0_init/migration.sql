-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
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
    "space_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("space_id")
);

-- CreateTable
CREATE TABLE "Content" (
    "content_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "content_type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "YoutubeContent" (
    "content_id" TEXT NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "thumbnail_url" VARCHAR(255) NOT NULL,
    "transcript" TEXT NOT NULL,
    "youtube_url" VARCHAR(255) NOT NULL,

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
CREATE TABLE "Space_Content" (
    "space_content_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,

    CONSTRAINT "Space_Content_pkey" PRIMARY KEY ("space_content_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeContent_youtube_id_key" ON "YoutubeContent"("youtube_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentContent_doc_id_key" ON "DocumentContent"("doc_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentContent_hash_key" ON "DocumentContent"("hash");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "Space"("space_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "YoutubeContent" ADD CONSTRAINT "YoutubeContent_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DocumentContent" ADD CONSTRAINT "DocumentContent_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Space_Content" ADD CONSTRAINT "Space_Content_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "Space"("space_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Space_Content" ADD CONSTRAINT "Space_Content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("content_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

