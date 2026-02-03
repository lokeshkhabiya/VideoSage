import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { getAuthUser } from "@/lib/auth";
import { enqueueContentProcessing } from "@/lib/jobs";

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const paramV = u.searchParams.get("v");
    if (paramV) return paramV;
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/")[2] || null;
    }
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.split("/")[2] || null;
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const youtube_url: string | undefined = body.youtube_url ?? body.source_url;
    let spaceId: string | undefined = body.space_id;

    if (!youtube_url) {
      return NextResponse.json(
        { error: "youtube_url is required" },
        { status: 400 }
      );
    }

    if (!spaceId) {
      let defaultSpace = await prisma.space.findFirst({
        where: {
          user_id: user.user_id,
          space_name: "Default",
        },
      });

      if (!defaultSpace) {
        defaultSpace = await prisma.space.create({
          data: {
            user_id: user.user_id,
            space_name: "Default",
          },
        });
      }
      spaceId = defaultSpace.space_id;
    } else {
      const space = await prisma.space.findFirst({
        where: {
          space_id: spaceId,
          user_id: user.user_id,
        },
      });
      if (!space) {
        return NextResponse.json(
          { error: "Space not found" },
          { status: 404 }
        );
      }
    }

    const videoId = extractYoutubeId(youtube_url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract valid video ID from youtube_url" },
        { status: 400 }
      );
    }

    const existingYoutubeContent = await prisma.youtubeContent.findUnique({
      where: { youtube_id: videoId },
      include: {
        content: true,
      },
    });

    let contentId: string;
    let shouldEnqueue = false;
    let videoTitle = "Untitled";
    let videoDescription = "";
    let videoThumbnail = "";

    if (existingYoutubeContent) {
      contentId = existingYoutubeContent.content_id;
      videoTitle = existingYoutubeContent.title || videoTitle;
      videoDescription = existingYoutubeContent.description || videoDescription;
      videoThumbnail = existingYoutubeContent.thumbnail_url || videoThumbnail;

      const userContentRecord = await prisma.userContent.findUnique({
        where: {
          user_id_content_id: {
            user_id: user.user_id,
            content_id: contentId,
          },
        },
      });
      if (!userContentRecord) {
        await prisma.userContent.create({
          data: {
            user_id: user.user_id,
            content_id: contentId,
          },
        });
      }

      if (
        !existingYoutubeContent.transcript ||
        (Array.isArray(existingYoutubeContent.transcript) &&
          existingYoutubeContent.transcript.length === 0)
      ) {
        shouldEnqueue = true;
      }
    } else {
      if (!process.env.YOUTUBE_APIKEY) {
        return NextResponse.json(
          { error: "Missing YOUTUBE_APIKEY" },
          { status: 500 }
        );
      }

      const metadataResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_APIKEY}`
      );
      const metadata = metadataResponse.data as {
        items: {
          snippet: {
            title: string;
            description: string;
            thumbnails: { standard?: { url: string }; high?: { url: string } };
          };
        }[];
      };
      if (!metadata.items || metadata.items.length === 0) {
        return NextResponse.json(
          { error: "Could not fetch YouTube video metadata" },
          { status: 404 }
        );
      }
      const snippet = metadata.items[0].snippet || {};
      videoTitle = snippet.title || "Untitled";
      videoDescription = snippet.description || "";
      videoThumbnail =
        snippet?.thumbnails?.standard?.url ||
        snippet?.thumbnails?.high?.url ||
        "";

      contentId = uuid();

      await prisma.content.create({
        data: {
          content_id: contentId,
          content_type: "YOUTUBE_CONTENT",
          created_at: new Date(),
          users: {
            create: {
              user_id: user.user_id,
            },
          },
          youtubeContent: {
            create: {
              youtube_id: videoId,
              title: videoTitle,
              description: videoDescription,
              thumbnail_url: videoThumbnail,
              youtube_url: youtube_url,
              transcript: [],
            },
          },
        },
      });

      shouldEnqueue = true;
    }

    await prisma.spaceContent.upsert({
      where: {
        space_id_content_id: {
          space_id: spaceId,
          content_id: contentId,
        },
      },
      create: {
        space_id: spaceId,
        content_id: contentId,
      },
      update: {},
    });

    let jobId: string | null = null;
    if (shouldEnqueue) {
      const existingJob = await prisma.contentProcessingJob.findFirst({
        where: {
          content_id: contentId,
          status: { in: ["QUEUED", "PROCESSING"] },
        },
        orderBy: { created_at: "desc" },
      });

      if (existingJob) {
        jobId = existingJob.job_id;
      } else {
        const job = await enqueueContentProcessing({
          contentId,
          youtubeId: videoId,
          youtubeUrl: youtube_url,
        });
        jobId = job.job_id;
      }
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          space_id: spaceId,
          content_id: contentId,
          youtube_id: videoId,
          type: "YOUTUBE_CONTENT",
          title: videoTitle,
          thumbnail_url: videoThumbnail,
          job_id: jobId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while adding youtube content: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userContent = await prisma.userContent.findUnique({
    where: {
      user_id_content_id: {
        user_id: user.user_id,
        content_id: id,
      },
    },
  });

  if (!userContent) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  try {
    const youtubeContent = await prisma.youtubeContent.findUnique({
      where: { content_id: id },
      include: {
        content: {
          select: {
            content_type: true,
          },
        },
      },
    });

    if (!youtubeContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({
      youtubeUrl: youtubeContent.youtube_url,
      youtube_id: youtubeContent.youtube_id,
      thumbnailUrl: youtubeContent.thumbnail_url,
      transcript: youtubeContent.transcript,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
