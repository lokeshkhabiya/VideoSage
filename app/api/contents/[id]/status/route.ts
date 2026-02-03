import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentId = params.id;

  const userContent = await prisma.userContent.findUnique({
    where: {
      user_id_content_id: {
        user_id: user.user_id,
        content_id: contentId,
      },
    },
  });

  if (!userContent) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const latestJob = await prisma.contentProcessingJob.findFirst({
    where: { content_id: contentId },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(
    {
      content_id: contentId,
      job: latestJob
        ? {
            job_id: latestJob.job_id,
            status: latestJob.status,
            step: latestJob.step,
            error: latestJob.error,
            updated_at: latestJob.updated_at,
          }
        : null,
    },
    { status: 200 }
  );
}
