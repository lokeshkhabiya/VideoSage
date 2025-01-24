import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { YoutubeTranscript } from "youtube-transcript";
import { Pinecone } from "@pinecone-database/pinecone"
import { FeatureExtractionPipeline } from "@xenova/transformers";

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
  