import { fetchTranscripts, generateEmbeddings, initializePinecone, preprocessTranscript, transcriptInterface, upsertChunksToPinecone } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { v4 as uuid } from "uuid"
import axios from "axios";

interface VideoMetadata {
  title: string;
  description: string;
  thumbnails: {
    standard: {
      url: string;
    };
  };
}

export async function POST(req: NextRequest) {
    try {
        const user = await JSON.parse(req.headers.get("user") || "");
        
        // Add user verification
        const existingUser = await prisma.user.findUnique({
            where: {
                user_id: user.user_id
            }
        });

        if (!existingUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { youtube_url } = body;

        if (!youtube_url) {
            return NextResponse.json(
                { message: "Youtube URL is required" },
                { status: 400 }
            );
        }

        const videoIdMatch = youtube_url.match(/[?&]v=([^&]+)/);
        if (!videoIdMatch) {
            return NextResponse.json(
                { message: "No video / video id found!"}, 
                { status: 404 }
            )
        }
        const video_id = videoIdMatch[1];

        // transcripts 
        const transcript: transcriptInterface[] | null = await fetchTranscripts(video_id);
        if (!transcript || transcript.length === 0) {
            return NextResponse.json(
                { message: "Error while processing youtube video!"},
                { status: 401}
            )
        }

        // metadata: 
        const metadataResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${video_id}&key=${process.env.YOUTUBE_APIKEY}`);
        const metadata = metadataResponse.data as { items: { snippet: VideoMetadata }[] };
        if (!metadata.items || metadata.items.length === 0) {
            return NextResponse.json(
                { message: "Could not fetch video metadata" },
                { status: 404 }
            );
        }
        const metadataItems = metadata.items[0].snippet;

        // Check if this YouTube video has already been processed
        const existingYoutubeContent = await prisma.youtubeContent.findFirst({
            where: {
                youtube_id: video_id
            },
            include: {
                content: true
            }
        });

        const processedTranscriptChunks = await preprocessTranscript(transcript);

        let contentId;
        if (existingYoutubeContent) {
            contentId = existingYoutubeContent.content_id;
            // Check if this user has already added this YouTube video
            const existingUserContent = await prisma.userContent.findFirst({
                where: {
                    user_id: user.user_id,
                    content_id: contentId
                }
            });

            if (existingUserContent) {
                return NextResponse.json(
                    { message: "You have already added this YouTube video" },
                    { status: 200 }
                );
            }

            // Add the existing content to the user's contents
            await prisma.userContent.create({
                data: {
                    user_id: user.user_id,
                    content_id: contentId
                }
            });
        } else {
            contentId = uuid();
            // Create new content and associate it with the user
            await prisma.content.create({
                data: {
                    content_id: contentId,
                    content_type: "YOUTUBE_CONTENT",
                    created_at: new Date(),
                    youtubeContent: {
                        create: {
                            youtube_id: video_id,
                            title: metadataItems?.title || "",
                            description: metadataItems?.description || "",
                            thumbnail_url: metadataItems?.thumbnails?.standard?.url || "",
                            transcript: processedTranscriptChunks,
                            youtube_url: youtube_url,
                        }
                    },
                    users: {
                        create: {
                            user_id: user.user_id
                        }
                    }
                }
            });

            // Vector processing
            const pineconeIndex = await initializePinecone();
            const embeddedChunks = await generateEmbeddings(processedTranscriptChunks, video_id);
            await upsertChunksToPinecone(pineconeIndex, embeddedChunks);
        }

        return NextResponse.json({ 
            message: `Successfully added youtube content${existingYoutubeContent ? ' (reused existing vectors)' : ''}`,
            data: {
                content_id: contentId,
                youtube_id: video_id,
            }
        }, { status: 200 }
        );
      
    } catch (error) {
        console.error("Error while adding youtube content: ", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { message: "Error while adding youtube content" },
            { status: 500 }
        );
    }
}