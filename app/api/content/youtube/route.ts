import { fetchTranscripts, generateEmbeddings, initializePinecone, preprocessTranscript, transcriptInterface, upsertChunksToPinecone } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { pipeline } from "@xenova/transformers";
import prisma from "@/lib/prisma"
import { v4 as uuid } from "uuid"
import axios from "axios";

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
        const { youtube_url, space_id } = body;

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
        const fullTranscript = transcript.map((t) => t.text).join(" ");

        // metadata: 
        const metadataResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${video_id}&key=${process.env.YOUTUBE_APIKEY}`);
        const metadata = metadataResponse.data as { items: { snippet: any }[] };
        if (!metadata.items || metadata.items.length === 0) {
            return NextResponse.json(
                { message: "Could not fetch video metadata" },
                { status: 404 }
            );
        }
        const metadataItems = metadata.items[0].snippet;

        // Check if this user has already added this YouTube video
        const existingContent = await prisma.content.findFirst({
            where: {
                user_id: user.user_id,
                youtubeContent: {
                    youtube_id: video_id
                }
            }
        });

        if (existingContent) {
            return NextResponse.json(
                { message: "You have already added this YouTube video" },
                { status: 200 }
            );
        }

        // Check if this YouTube video has already been processed
        const existingYoutubeContent = await prisma.youtubeContent.findFirst({
            where: {
                youtube_id: video_id
            },
            include: {
                content: true
            }
        });

        const contentId = uuid();
        const createContent = await prisma.content.create({
            data: {
                content_id: contentId,
                user_id: user.user_id,
                space_id: space_id || null,
                content_type: "YOUTUBE_CONTENT",
                created_at: new Date(),
                youtubeContent: {
                    create: {
                        youtube_id: video_id,
                        title: metadataItems?.title || "",
                        description: metadataItems?.description || "",
                        thumbnail_url: metadataItems?.thumbnails?.standard?.url || "",
                        transcript: fullTranscript,
                        youtube_url: youtube_url,
                    }
                }
            }
        });

        // Vector processing
        const pineconeIndex = await initializePinecone();
        
        // Only process vectors if this video hasn't been processed before
        if (!existingYoutubeContent) {
            const processedChunks = preprocessTranscript(transcript);
            const embeddingPipeline = await pipeline("feature-extraction", "mixedbread-ai/mxbai-embed-large-v1", {
                revision: "main",
                quantized: false
            });
            
            const embeddedChunks = await generateEmbeddings(processedChunks, embeddingPipeline, video_id);
            await upsertChunksToPinecone(pineconeIndex, embeddedChunks);
        }

        return NextResponse.json({ 
            message: `Successfully added youtube content${!existingYoutubeContent ? '' : ' (reused existing vectors)'}`,
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