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
    console.log(reqBody);

    const messages: Message[] = reqBody.messages;
    const userQuestion = messages[messages.length - 1].content;
    
    const searchQuery = `Represent this sentence for searching relevant passages:${userQuestion}`

    const retrievals = await queryPineconeVectorStore(pc, "youtube-content", "videosage-namespace", searchQuery, video_id);

    // final prompt to gemini api
    const finalPrompt = `You are an AI assistant tasked with answering questions about a YouTube video based on its transcript. 

    Context:
    - You have access to relevant chunks of the video transcript.
    - The user may ask follow-up questions.
    - Previous conversation history is available in the messages array.
    - Each message has a role (user/assistant) and content.
    
    Instructions:
    1. Carefully analyze the provided transcript chunks.
    2. Focus only on information explicitly stated in the transcript.
    3. If the answer cannot be found in the transcript, acknowledge this limitation but provide your thoughtful insights based on the context.
    4. Try to include the timestamps (startTime) from the transcript chunks when referencing information.
    5. Structure your response as follows:
       - First, directly answer the user's question in a clear and concise way
       - Provide specific examples or quotes from the transcript to support your answer
       - Add relevant context from other parts of the transcript if it helps understanding
       - If the question can't be fully answered from the transcript, explain what you can confidently say
       - Use natural, conversational language while maintaining accuracy
       - Reference timestamps when citing specific information
    
    User Question: ${userQuestion}
    
    Relevant Transcript Chunks:
    ${retrievals}

    message history: 
    ${messages}
    
    Please provide a clear, accurate, and well-structured response based on the transcript evidence provided, with timestamps (startTime) for all referenced information.`;
    

    // stream response from gemini 

    const result = await streamText({
        model: model,
        prompt: finalPrompt
    })

    return result.toDataStreamResponse();
}