import prisma from "./prisma";
import { processContentPipeline } from "./pipeline";

export async function enqueueContentProcessing(params: {
  contentId: string;
  youtubeId: string;
  youtubeUrl: string;
}) {
  const jobRecord = await prisma.contentProcessingJob.create({
    data: {
      content_id: params.contentId,
      status: "QUEUED",
      step: "TRANSCRIPT",
    },
  });

  const useInline =
    process.env.CONTENT_PROCESSING_MODE === "inline" ||
    (!process.env.REDIS_URL && !process.env.REDIS_HOST);

  if (useInline) {
    await processContentPipeline({
      contentId: params.contentId,
      youtubeId: params.youtubeId,
      youtubeUrl: params.youtubeUrl,
      jobId: jobRecord.job_id,
    });
  } else {
    const { contentQueue } = await import("./queue");
    await contentQueue.add("process", {
      contentId: params.contentId,
      youtubeId: params.youtubeId,
      youtubeUrl: params.youtubeUrl,
      jobId: jobRecord.job_id,
    });
  }

  return jobRecord;
}
