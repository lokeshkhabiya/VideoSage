import prisma from "../lib/prisma";
import { enqueueContentProcessing } from "../lib/jobs";

type EmptyTranscriptRow = {
  content_id: string;
  youtube_id: string;
  youtube_url: string;
};

const DRY_RUN = process.env.DRY_RUN === "true";

const main = async () => {
  const rows = (await prisma.$queryRaw<
    EmptyTranscriptRow[]
  >`SELECT "content_id", "youtube_id", "youtube_url"
    FROM "YoutubeContent"
    WHERE "transcript" IS NULL
       OR (jsonb_typeof("transcript") = 'array' AND jsonb_array_length("transcript") = 0);`) ?? [];

  if (rows.length === 0) {
    console.info("[requeue-empty-transcripts] No empty transcripts found.");
    return;
  }

  console.info(
    `[requeue-empty-transcripts] Found ${rows.length} items (dryRun=${DRY_RUN}).`,
  );

  let queued = 0;
  let skipped = 0;

  for (const row of rows) {
    const existingJob = await prisma.contentProcessingJob.findFirst({
      where: {
        content_id: row.content_id,
        status: { in: ["QUEUED", "PROCESSING"] },
      },
      orderBy: { created_at: "desc" },
    });

    if (existingJob) {
      skipped += 1;
      console.info("[requeue-empty-transcripts] Skip, job exists", {
        content_id: row.content_id,
        job_id: existingJob.job_id,
        status: existingJob.status,
      });
      continue;
    }

    if (DRY_RUN) {
      queued += 1;
      console.info("[requeue-empty-transcripts] Would enqueue", {
        content_id: row.content_id,
        youtube_id: row.youtube_id,
      });
      continue;
    }

    await enqueueContentProcessing({
      contentId: row.content_id,
      youtubeId: row.youtube_id,
      youtubeUrl: row.youtube_url,
    });

    queued += 1;
    console.info("[requeue-empty-transcripts] Enqueued", {
      content_id: row.content_id,
      youtube_id: row.youtube_id,
    });
  }

  console.info("[requeue-empty-transcripts] Done", { queued, skipped });
};

main()
  .catch((error) => {
    console.error("[requeue-empty-transcripts] Failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
