import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateFlashCards } from "@/lib/utils";
import { v4 as uuid } from "uuid";


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

        const existingMetadata = await prisma.metadata.findUnique({
            where: {
                youtube_id: video_id
            }
        })

        if (!existingMetadata) {
            await prisma.metadata.create({
                data: {
                    metadata_id: uuid(),
                    youtube_id: video_id,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            })
        }

        if (!existingMetadata?.flashcards) {
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

            const transcripts = (youtubeData.transcript as { text: string, startTime: string, endTime: string }[]).map(chunk => chunk.text);
            const fullTranscript = transcripts.join(" ");

            const flashcards = await generateFlashCards(fullTranscript);

            if (!flashcards) {
                return NextResponse.json(
                    { message: "Could not generate flashcards!"},
                    { status: 500 }
                )
            }
            const cleanedFlashcards = flashcards.replace(/```json\n|```/g, '');
            // Ensure the flashcards string is valid JSON
            let flashcardsJson;
            try {
                flashcardsJson = JSON.parse(cleanedFlashcards);
            } catch (parseError) {
                console.error("Error parsing flashcards JSON: ", parseError);
                return NextResponse.json(
                    { message: "Invalid flashcards format!"},
                    { status: 500 }
                );
            }

            await prisma.metadata.update({
                where: { youtube_id: video_id },
                data: { flashcards: flashcardsJson }
            });

            return NextResponse.json(
                {
                    message: "flashcards generated Successfully!",
                    data: flashcardsJson
                }, { status: 200 }
            )

        } else {
            return NextResponse.json(
                {
                    message: "Found flashcards Successfully!",
                    data: existingMetadata.flashcards
                }, { status: 200 }
            )
        }

    } catch (error) {
        console.error("Error while generating flashcard: ", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { message: "Error while generating flashcards content!"},
            { status: 500 }
        )
    }
}