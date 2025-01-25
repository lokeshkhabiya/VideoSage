import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { YoutubeTranscript } from "youtube-transcript";
import { Pinecone } from "@pinecone-database/pinecone"
import { FeatureExtractionPipeline } from "@xenova/transformers";
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export interface transcriptInterface {
    text: string,
    duration: number,
    offset: number,
    lang: string
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchTranscripts (video_id: string): Promise<transcriptInterface[] | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(video_id, {
        lang: 'en'
    });

    const formattedTranscript: transcriptInterface[] = transcript.map(item => ({
      text: item.text,
      duration: item.duration,
      offset: item.offset,
      lang: item.lang || 'en'
    }));

    return formattedTranscript;
    
    } catch (transcriptError: any) {
        console.error("Error fetching transcript:", transcriptError);
        return null;
    }
}

export const initializePinecone = async () => {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!
    });

    // await pinecone.init({
    //   environment: "YOUR_ENVIRONMENT", // Replace with your Pinecone environment
    //   apiKey: "YOUR_API_KEY", // Replace with your Pinecone API key
    // });
    return pinecone.Index("youtube-content");
};
export const preprocessTranscript = async (transcript: transcriptInterface[], chunkSize = 300): Promise<{ text: string, startTime: number | null, endTime: number | null }[]> => {
    const chunks: { text: string, startTime: number | null, endTime: number | null }[] = [];
    let currentChunk = { text: "", startTime: null as number | null, endTime: null as number | null };
  
    transcript.forEach((item, index) => {
      if (!currentChunk.startTime) currentChunk.startTime = item.offset as number;
  
      currentChunk.text += (currentChunk.text ? " " : "") + item.text;
      currentChunk.endTime = (item.offset + item.duration) as number;
  
      if (currentChunk.text.split(" ").length >= chunkSize || index === transcript.length - 1) {
        chunks.push({ ...currentChunk });
        currentChunk = { text: "", startTime: null, endTime: null };
      }
    });
    return chunks;
};

export const generateEmbeddings = async (chunks: any, embeddingPipeline: FeatureExtractionPipeline, video_id: string) => {
    return Promise.all(
      chunks.map(async (chunk: any, i: number) => {
        const embedding = await embeddingPipeline(chunk.text, { pooling: "mean", normalize: true });
        return {
          id: `${video_id}-chunk-${i}`,
          video_id: video_id,
          text: chunk.text,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          vector: embedding.data,
        };
      })
    );
  };

  export const upsertChunksToPinecone = async (index: any, chunks: any) => {
    // Ensure vectors is an array and matches Pinecone's expected format
    const vectors = chunks.map((chunk: any) => ({
        id: chunk.id,
        values: Array.from(chunk.vector), // Convert to regular array if it's not already
        metadata: {
            video_id: chunk.video_id,
            text: chunk.text,
            startTime: chunk.startTime,
            endTime: chunk.endTime,
        },
    }));
    
    // Upsert in batches of 100 to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
    }
};

export const summarizeChunks = async (transcripts: string) => {
  const prompt = `You are a summarization assistant. Please provide a concise summary of the following YouTube video transcript in 300 words latest. Focus on the key points and main ideas discussed in the video. Give summary in structured manner. Do not include any introductory phrases or timestamps - just provide the direct summary of the content.`
  const generateContent = await model.generateContent([prompt, transcripts])
  return generateContent?.response?.text();
}

export const generateFlashCards = async (transcripts: string) => {
  const prompt = `You are an AI assistant trained to generate flashcards from youtube transcripts for educational purposes. Your task is to create structured flashcards in JSON format with the following fields:

                  1. **Question**: A clear and concise question about the topic.
                  2. **Hint**: A helpful clue or additional information to assist in answering the question.
                  3. **Answer**: The correct and precise answer to the question.
                  4. **Explanation**: A brief but detailed explanation of the answer for better understanding.
                  5. **Source**: The approximate timestamp of the relevant video or material, represented in the format "MM:SS" (e.g., 12:45).

                  Follow these rules:
                  - Ensure all fields are present for each flashcard.
                  - Keep the format machine-readable (JSON).
                  - The "Hint" should not reveal the full answer but give helpful context.
                  - The "Source" must be approximate, and if no video is referenced, mention "N/A."

                  Here is an example of the required output structure:
                  {
                    "flashcards": [
                      {
                        "question": "What is supervised learning in Machine Learning?",
                        "hint": "It involves labeled data.",
                        "answer": "A type of machine learning where the model is trained on labeled data to make predictions.",
                        "explanation": "Supervised learning uses input-output pairs to teach the model how to predict outcomes based on labeled examples.",
                        "source": "08:30"
                      },
                      {
                        "question": "What does 'OOP' stand for in programming?",
                        "hint": "It’s related to a paradigm focusing on 'objects.'",
                        "answer": "Object-Oriented Programming.",
                        "explanation": "OOP is a programming paradigm based on the concept of objects containing data and methods for data manipulation.",
                        "source": "N/A"
                      }
                    ]
                  }
                  Always format your response in JSON for consistency.
  `
  const generateContent = await model.generateContent([prompt, transcripts])
  return generateContent.response.text(); 
}

export const generateQuiz = async (transcripts: string) => {
  const prompt = `You are an intelligent assistant trained to generate multiple-choice quizzes from YouTube video transcripts. Your task is to analyze the content of the transcript and create meaningful quiz questions for important topics covered in the video. There should be aleast 10 question. Generate more if transcript is long. Ensure every important topic / knowledge is covered.
                Each quiz entry must include the following:
                1. **Question**: A well-framed question based on the content.
                2. **Options**: Four answer options, with only one being correct.
                3. **Correct Option**: The correct answer to the question.
                4. **Explanation with Timestamp**: A concise explanation of the answer, including the approximate timestamp (in mm:ss format) from the transcript where this topic is discussed.

                Ensure that the content is:
                - Structured in a machine-readable JSON format.
                - Accurate and contextually relevant to the video content.
                - Succinct but informative, especially in the explanation.

                Here is the required JSON format for the output:
                {
                  "questions": [
                    {
                      "question": "What is the primary purpose of reinforcement learning?",
                      "options": [
                        "To mimic human reasoning",
                        "To find patterns in data", 
                        "To optimize decision-making through trial and error",
                        "To classify images"
                      ],
                      "correct_option": "To optimize decision-making through trial and error",
                      "explanation": "Reinforcement learning focuses on training an agent to make decisions in an environment to maximize cumulative reward. Discussed at 12:34 in the transcript.",
                      "timestamp": "12:34"
                    }
                  ]
                }`
  const generateContent = await model.generateContent([prompt, transcripts]);
  return generateContent.response.text(); 
}
  