import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuid } from "uuid"
import { generateQuiz } from "@/lib/utils";

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

        const existingMetadata = await prisma.metadata.findUnique({
            where: {
                youtube_id: video_id
            }
        });

        if (!existingMetadata) {
            await prisma.metadata.create({
                data: {
                    metadata_id: uuid(),
                    youtube_id: video_id,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
        }

        if (!existingMetadata?.quiz) {
            const youtubeData = await prisma.youtubeContent.findUnique({
                where: {
                    content_id: content_id,
                    youtube_id: video_id
                }
            });
            
            if (!youtubeData?.transcript) {
                return NextResponse.json(
                    { message: "No transcript found for this video" },
                    { status: 404 }
                );
            }

            const transcripts = (youtubeData.transcript as { text: string, startTime: string, endTime: string }[]).map(chunk => chunk.text);
            const fullTranscript = transcripts.join(" ");

            const quiz = await generateQuiz(fullTranscript);

            if (!quiz) {
                return NextResponse.json(
                    { message: "Could not generate summary" },
                    { status: 500 }
                );
            }
            const cleanedQuiz = quiz.replace(/```json\n|```/g, '');

            let quizJson;
            try {
                quizJson = JSON.parse(cleanedQuiz);
            } catch (parseError) {
                console.error("Error parsing quiz JSON: ", parseError);
                return NextResponse.json(
                    { message: "Invalid quiz format!"},
                    { status: 500 }
                );
            }

            await prisma.metadata.update({
                where: { youtube_id: video_id },
                data: { quiz: quizJson }
            });

            return NextResponse.json({ 
                message: `Successfully created quiz for content_id: ${content_id} and youtube_id: ${video_id}`,
                data: quizJson
            });

        } else {
            return NextResponse.json({ 
                message: "Found quiz Successfully!",
                data: existingMetadata.quiz
            }, { status: 200 })
        }

    } catch (error) {
        console.error("Error while generating quiz: ", error instanceof Error ? error.message : error );
        return NextResponse.json(
            { message: "Error while generating quiz content!"},
            { status: 500 }
        )
    }
}