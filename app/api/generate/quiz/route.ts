import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateQuiz } from "@/lib/utils";
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
        });

        if (!existingMetadata) {
            await prisma.contentMetadata.create({
                data: {
                    content_id,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
        }

        if (!existingMetadata?.quiz) {
            const youtubeData = await prisma.youtubeContent.findUnique({
                where: {
                    content_id: content_id
                }
            });
            
            if (!youtubeData?.transcript) {
                return NextResponse.json(
                    { message: "No transcript found for this video" },
                    { status: 404 }
                );
            }

            const transcripts = (youtubeData.transcript as { text: string, startTime: number, endTime: number }[]).map(chunk => chunk.text);
            const fullTranscript = transcripts.join(" ");

            const quiz = await generateQuiz(fullTranscript);

            if (!quiz) {
                return NextResponse.json(
                    { message: "Could not generate summary" },
                    { status: 500 }
                );
            }
            
            // Clean and validate the JSON response
            let cleanedQuiz = quiz.trim();
            
            // Remove markdown code blocks if present
            cleanedQuiz = cleanedQuiz.replace(/```json\n?/g, '');
            cleanedQuiz = cleanedQuiz.replace(/```\n?/g, '');
            
            // Remove any leading/trailing whitespace
            cleanedQuiz = cleanedQuiz.trim();
            
            // Try to find JSON content between first { and last }
            const firstBrace = cleanedQuiz.indexOf('{');
            const lastBrace = cleanedQuiz.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleanedQuiz = cleanedQuiz.substring(firstBrace, lastBrace + 1);
            }

            let quizJson;
            try {
                quizJson = JSON.parse(cleanedQuiz);
                
                // Validate the structure
                if (!quizJson.questions || !Array.isArray(quizJson.questions)) {
                    throw new Error("Missing or invalid 'questions' array");
                }
                
                // Validate each question
                for (const question of quizJson.questions) {
                    if (!question.question || !question.options || !Array.isArray(question.options) || 
                        !question.correct_option || !question.explanation || !question.timestamp) {
                        throw new Error("Invalid question structure");
                    }
                }
                
            } catch (parseError) {
                console.error("Error parsing quiz JSON: ", parseError);
                console.error("Cleaned quiz content:", cleanedQuiz.substring(0, 1000)); // Log first 1000 chars
                return NextResponse.json(
                    { message: "Invalid quiz format!"},
                    { status: 500 }
                );
            }

            await prisma.contentMetadata.update({
                where: { content_id },
                data: { quiz: quizJson }
            });

            return NextResponse.json({ 
                message: `Successfully created quiz for content_id: ${content_id}`,
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
