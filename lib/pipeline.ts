import prisma from "./prisma";
import {
  fetchTranscriptWithFallback,
  generateEmbeddings,
  initializePinecone,
  preprocessTranscript,
  upsertChunksToPinecone,
} from "./utils";
import { logger } from "./logger";

export async function processContentPipeline(params: {
  contentId: string;
  youtubeId: string;
  youtubeUrl: string;
  jobId: string;
}) {
  const { contentId, youtubeId, youtubeUrl, jobId } = params;

  logger.info({ contentId, youtubeId, jobId }, "Processing content pipeline");

  await prisma.contentProcessingJob.update({
    where: { job_id: jobId },
    data: { status: "PROCESSING" },
  });

  let transcript: Awaited<ReturnType<typeof fetchTranscriptWithFallback>> = null;
  try {
    transcript = await fetchTranscriptWithFallback({
      videoUrl: youtubeUrl,
      videoId: youtubeId,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    await prisma.contentProcessingJob.update({
      where: { job_id: jobId },
      data: {
        status: "FAILED",
        error: errorMessage,
      },
    });
    throw error;
  }

  if (!transcript || transcript.length === 0) {
    await prisma.contentProcessingJob.update({
      where: { job_id: jobId },
      data: {
        status: "FAILED",
        error: "Transcript not found",
      },
    });
    throw new Error("Transcript not found");
  }

  const processedTranscriptChunks = await preprocessTranscript(transcript);

  await prisma.youtubeContent.update({
    where: { content_id: contentId },
    data: {
      transcript: processedTranscriptChunks,
    },
  });

  await prisma.contentProcessingJob.update({
    where: { job_id: jobId },
    data: { step: "EMBEDDINGS" },
  });

  try {
    const pineconeIndex = await initializePinecone();
    const embeddedChunks = await generateEmbeddings(
      processedTranscriptChunks,
      youtubeId
    );
    await upsertChunksToPinecone(pineconeIndex, embeddedChunks);
  } catch (error) {
    await prisma.contentProcessingJob.update({
      where: { job_id: jobId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Embedding failed",
      },
    });
    throw error;
  }

  await prisma.contentProcessingJob.update({
    where: { job_id: jobId },
    data: { status: "COMPLETED" },
  });
}
