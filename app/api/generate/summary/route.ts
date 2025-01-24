import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { summarizeChunks } from "@/lib/utils";
import { v4 as uuid } from "uuid"

export async function GET(req: NextRequest) {
    try {
        const params = req.nextUrl.searchParams;
        const video_id = params.get("video_id");
        const content_id = params.get("content_id");
        const user = await JSON.parse(req.headers.get("user") || "");

        if (!video_id || !content_id) {
            return NextResponse.json(
                { message: "Please provide video_id and content_id!"},
                { status: 403 }
            )
        }

        // Check if content exists for this user
        const userContentExist = await prisma.userContent.findUnique({
            where: {
                user_id_content_id: {
                    user_id: user.user_id,
                    content_id: content_id
                }
            }
        });

        if (!userContentExist) {
            return NextResponse.json(
                { message: "Content not found for the user! "}, { status: 401 }
            )
        }

        const metadata = await prisma.metadata.findUnique({
            where: {
                youtube_id: video_id
            }
        });
        // check if metadata contains that video generation data 
        
        if (!metadata) {
            // create the generation data 
            
            // 1. get transcripts stored in youtubeContent 
            const youtubeData = await prisma.youtubeContent.findUnique(
                {
                    where: {
                        content_id: content_id,
                        youtube_id: video_id
                    }
                }
            )
            
            if (!youtubeData?.transcript) {
                return NextResponse.json(
                    { message: "No transcript found for this video" },
                    { status: 404 }
                );
            }

            // 2. create chunks and hit gemini api to create summary chunks and join to create entire summary
            const transcripts = (youtubeData.transcript as { text: string, startTime: string, endTime: string }[]).map(chunk => chunk.text);
            const fullTranscript = transcripts.join(" ");
            
            const summary = await summarizeChunks(fullTranscript);
            
            if (!summary) {
                return NextResponse.json(
                    { message: "Could not generate summary" },
                    { status: 500 }
                );
            }

            await prisma.metadata.create(
                {
                    data: {
                        metadata_id: uuid(),
                        youtube_id: video_id,
                        summary: summary,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                }
            )
            
            // 3. return the summary
            return NextResponse.json({ 
                message: `Successfully created summary for content_id: ${content_id} and youtube_id: ${video_id}`,
                data: summary
            });

        } else {
            return NextResponse.json(
                { 
                    message: "Found summary Successfully!",
                    data: metadata.summary
                }, { status: 200 }
            )
        }

    } catch (error) {
        console.error("Error while generating summary: ", error instanceof Error ? error.message : error );
        return NextResponse.json(
            { message: "Error while generating summary content!"},
            { status: 500 }
        )
    }
}     