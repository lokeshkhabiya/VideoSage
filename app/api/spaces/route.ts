import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1) Get token from Authorization: Bearer <token>
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2) Verify JWT
    const payload = await verifyJwtToken(token, process.env.JWT_SECRET!);
    const userId = payload?.user_id;
    if (!userId) {
      return NextResponse.json(
        { message: "Invalid token: missing user_id" },
        { status: 401 }
      );
    }

    // 3) Fetch all spaces belonging to this user, including their contents
    const userSpaces = await prisma.space.findMany({
      where: { user_id: userId },
      include: {
        contents: {
          include: {
            content: {
              include: {
                youtubeContent: true, // Include YouTube-specific data
                documentContent: true, // Include Document-specific data
              },
            },
          },
        },
      },
    });

    // 4) Transform the data into a front-end-friendly shape if needed
    const spaces = userSpaces.map((space) => ({
      id: space.space_id,
      name: space.space_name,
      createdAt: space.created_at,
      contents: space.contents.map((spaceContent) => ({
        id: spaceContent.content.content_id,
        type: spaceContent.content.content_type,
        createdAt: spaceContent.content.created_at,
        // If it’s a YouTube content:
        title: spaceContent.content.youtubeContent?.title || null,
        thumbnailUrl:
          spaceContent.content.youtubeContent?.thumbnail_url || null,
        // If it’s a Document content:
        filename: spaceContent.content.documentContent?.filename || null,
        fileUrl: spaceContent.content.documentContent?.file_url || null,
        youtube_id: spaceContent.content.youtubeContent?.youtube_id || null,
      })),
    }));

    return NextResponse.json({ spaces }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user spaces:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const payload = await verifyJwtToken(token, process.env.JWT_SECRET!);
    const userId = payload?.user_id;
    if (!userId) {
      return NextResponse.json(
        { message: "Invalid token: missing user_id" },
        { status: 401 }
      );
    }

    // Read JSON body
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Space name is required" },
        { status: 400 }
      );
    }

    // Create the space in DB
    const newSpace = await prisma.space.create({
      data: {
        user_id: userId,
        space_name: name.trim(),
      },
    });

    // Return the created space
    return NextResponse.json(
      {
        id: newSpace.space_id,
        name: newSpace.space_name,
        createdAt: newSpace.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating space:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
