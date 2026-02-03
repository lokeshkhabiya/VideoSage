import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateFlashCards } from "@/lib/utils";
import { getAuthUser } from "@/lib/auth";


export async function GET(req: NextRequest) {
    try {
        const params = req.nextUrl.searchParams;
        const content_id = params.get("content_id");
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized"},
                { status: 401 }
            )
        }

        if (!content_id) {
            return NextResponse.json(
                { message: "Please provide content_id!"},
                { status: 400 }
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

        const existingMetadata = await prisma.contentMetadata.findUnique({
            where: {
                content_id
            }
        })

        if (!existingMetadata) {
            await prisma.contentMetadata.create({
                data: {
                    content_id,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            })
        }

        if (!existingMetadata?.flashcards) {
            const youtubeData = await prisma.youtubeContent.findUnique(
                {
                    where: {
                        content_id: content_id
                    }
                }
            )
            
            if (!youtubeData?.transcript) {
                return NextResponse.json(
                    { message: "No transcript found for this video" },
                    { status: 404 }
                );
            }

            const transcripts = (youtubeData.transcript as { text: string, startTime: number, endTime: number }[]).map(chunk => chunk.text);
            const fullTranscript = transcripts.join(" ");

            const flashcards = await generateFlashCards(fullTranscript);

            if (!flashcards) {
                return NextResponse.json(
                    { message: "Could not generate flashcards!"},
                    { status: 500 }
                )
            }
            
            // Clean and validate the JSON response
            let cleanedFlashcards = flashcards.trim();
            
            // Remove markdown code blocks if present
            cleanedFlashcards = cleanedFlashcards.replace(/```json\n?/g, '');
            cleanedFlashcards = cleanedFlashcards.replace(/```\n?/g, '');
            
            // Remove any leading/trailing whitespace
            cleanedFlashcards = cleanedFlashcards.trim();
            
            // Try to find JSON content between first { and last }
            const firstBrace = cleanedFlashcards.indexOf('{');
            const lastBrace = cleanedFlashcards.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleanedFlashcards = cleanedFlashcards.substring(firstBrace, lastBrace + 1);
            }

            let flashcardsJson;
            try {
                flashcardsJson = JSON.parse(cleanedFlashcards);
                
                // Validate the structure
                if (!flashcardsJson.flashcards || !Array.isArray(flashcardsJson.flashcards)) {
                    throw new Error("Missing or invalid 'flashcards' array");
                }
                
                // Validate each flashcard
                for (const flashcard of flashcardsJson.flashcards) {
                    if (!flashcard.question || !flashcard.hint || 
                        !flashcard.answer || !flashcard.explanation || 
                        !flashcard.source) {
                        throw new Error("Invalid flashcard structure");
                    }
                }
                
            } catch (parseError) {
                console.error("Error parsing flashcards JSON: ", parseError);
                console.error("Cleaned flashcards content:", cleanedFlashcards.substring(0, 1000)); // Log first 1000 chars
                return NextResponse.json(
                    { message: "Invalid flashcards format!"},
                    { status: 500 }
                );
            }

            await prisma.contentMetadata.update({
                where: { content_id },
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
