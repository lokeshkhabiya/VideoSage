import { Message } from "ai/react";
import { NextRequest } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { queryPineconeVectorStore } from "@/lib/utils";
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

const google = createGoogleGenerativeAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    apiKey: process.env.GEMINI_API_KEY
})

const model = google.languageModel("gemini-1.5-flash")

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })

export async function POST(req: NextRequest) {
    const reqBody = await req.json();
    const video_id = reqBody.data.video_id

    const messages: Message[] = reqBody.messages;
    const userQuestion = messages[messages.length - 1].content;
    
    const searchQuery = `Represent this sentence for searching relevant passages:${userQuestion}`
    const retrievals = await queryPineconeVectorStore(pc, "youtube-content", "videosage-namespace-2", video_id, searchQuery);

    // final prompt to gemini api
    const finalPrompt = `You are a helpful and informative assistant designed to answer questions about YouTube videos. You will be provided with:

    1. **The user's question:** (This will be dynamically inserted.)
    2. **Contextual information retrieved from the video's transcript and metadata:** (This will be dynamically inserted as relevant chunks from the vector database.)

    Your goal is to provide a structured, accurate, and helpful answer to the user's question, drawing information from the provided context.

    **Important Instructions:**

    * **Structure your response in a clear, organized manner using appropriate headings and bullet points when applicable.**
    * **When citing information, include ONLY the start timestamp in [MM:SS] format (e.g., [12:34]). Do not use time ranges. Don't Forget colons between MM and SS**
    * **If the context doesn't fully cover the topic, supplement with accurate information while maintaining a cohesive response.**
    * **Focus on delivering comprehensive information in a well-structured format.**
    * **For technical or complex topics:**
        - Break down concepts into clear sections
        - Use bullet points for lists of principles, steps, or features
        - Include examples where appropriate
        - Maintain a logical flow from basic to advanced concepts
    * **Be thorough yet concise - avoid unnecessary words or repetition.**
    * **Do not include phrases like "according to the transcript" or "based on the context."**
    * **Do not include conversational elements or statements about your capabilities.**

    **Context:**

    User Question: ${userQuestion}
    
    Reference Context:
    ${retrievals}

    Previous Messages:
    ${messages}
    
    Provide a well-structured, informative response that thoroughly addresses the question.`;

    // stream response from gemini 

    const result = await streamText({
        model: model,
        prompt: finalPrompt
    })

    return result.toDataStreamResponse();
}