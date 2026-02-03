import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "../lib/queue";
import { processContentPipeline } from "../lib/pipeline";
import prisma from "../lib/prisma";
import { logger } from "../lib/logger";

new Worker(
  "content-processing",
  async (job) => {
    try {
      await processContentPipeline(job.data);
    } catch (error) {
      logger.error(
        { error, jobId: job.id, data: job.data },
        "Content processing failed"
      );

      if (job.data?.jobId) {
        await prisma.contentProcessingJob.update({
          where: { job_id: job.data.jobId },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }

      throw error;
    }
  },
  { connection }
);

logger.info("Content processing worker started");
