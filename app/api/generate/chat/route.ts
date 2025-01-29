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
    const content_id = reqBody.data.content_id

    const messages: Message[] = reqBody.messages;
    const userQuestion = messages[messages.length - 1].content;
    
    const searchQuery = `Represent this sentence for searching relevant passages:${userQuestion}`

    const retrievals = await queryPineconeVectorStore(pc, "youtube-content", "videosage-namespace-2", searchQuery, video_id);

    // final prompt to gemini api
    const finalPrompt = `You are an intelligent assistant having a natural conversation about the video content. You aim to be helpful, accurate and engaging in your responses.

    Context:
    - You have deep understanding of the video content
    - You can reference specific moments in the video using timestamps
    - You maintain context from previous messages in the conversation
    - You speak naturally while being precise and informative
    
    Instructions:
    1. Provide clear, direct answers that flow naturally
    2. Include relevant timestamps when discussing specific points
    3. Add helpful context to enrich the explanation
    4. Use a conversational, engaging tone
    5. Structure responses to be easy to follow
    6. Reference concrete examples to illustrate points
    
    User Question: ${userQuestion}
    
    Reference Context:
    ${retrievals}

    Previous Messages:
    ${messages}
    
    Please provide a natural, informative response that helps the user understand the content better.`;

    // stream response from gemini 

    const result = await streamText({
        model: model,
        prompt: finalPrompt
    })

    return result.toDataStreamResponse();
}