import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/spaces/[id]
 * Fetches a single space by ID, ensuring it belongs to the logged-in user.
 * Also includes the space's content items (YoutubeContent, DocumentContent, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spaceId = params.id;
    if (!spaceId) {
      return NextResponse.json(
        { message: "Space id is required" },
        { status: 400 }
      );
    }
    const user = await getAuthUser(request);
    const userId = user?.user_id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3) Fetch the space that belongs to this user
    //    Include any related content (youtube, doc, etc.)
    const space = await prisma.space.findFirst({
      where: {
        space_id: spaceId,
        user_id: userId,
      },
      include: {
        contents: {
          include: {
            content: {
              include: {
                youtubeContent: true,
                documentContent: true,
              },
            },
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        { message: "Space not found or not yours" },
        { status: 404 }
      );
    }

    // 4) Transform to a simpler shape for the front-end if needed
    const transformed = {
      id: space.space_id,
      name: space.space_name,
      createdAt: space.created_at,
      contents: space.contents.map((spaceContent) => ({
        id: spaceContent.content.content_id,
        type: spaceContent.content.content_type,
        createdAt: spaceContent.content.created_at,
        title: spaceContent.content.youtubeContent?.title ?? null,
        thumbnailUrl:
          spaceContent.content.youtubeContent?.thumbnail_url ?? null,
        filename: spaceContent.content.documentContent?.filename ?? null,
        fileUrl: spaceContent.content.documentContent?.file_url ?? null,
      })),
    };

    return NextResponse.json({ space: transformed }, { status: 200 });
  } catch (error) {
    console.error("Error fetching space:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
