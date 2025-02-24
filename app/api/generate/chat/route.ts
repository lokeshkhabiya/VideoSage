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
    const finalPrompt = `You are a helpful and informative assistant designed to answer questions about YouTube videos.  You will be provided with:

    1.  **The user's question:** (This will be dynamically inserted.)
    2.  **Contextual information retrieved from the video's transcript and metadata:** (This will be dynamically inserted as relevant chunks from the vector database.)

    Your goal is to provide a concise, accurate, and helpful answer to the user's question, drawing information from the provided context.  If the context does not contain the answer, don't state that you cannot answer the question based on the available information.

    **Important Instructions:**

    *   **Base your answer on the provided context.**  you may use any external knowledge or information beyond what is given only to explain the topic in a better way.
    *   **Provide the most relevant parts of the transcript as citations to support your answer.**  Indicate the start in the transcript, when referring to the transcript. Format the timestamp as [MM:SS].
    *   **If you don't have the information necessary to answer the question based on the provided context, state that you cannot answer it and briefly explain why.** E.g., "I'm sorry, but the provided context does not contain information, but according to me..." 
    *   **Focus on answering the specific question.**  Avoid generating overly verbose or conversational responses.
    *   **Be concise and avoid unnecessary fluff.**
    *   **Do not provide information about the overall video content or structure unless explicitly asked.** Your focus is on answering the user's specific question based on the retrieved transcript chunks.
    *   **Do not include a conversational intro or outro. Just get to the answer.**

    **Context:**

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