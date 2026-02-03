import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	YoutubeTranscript,
	YoutubeTranscriptNotAvailableLanguageError,
} from "youtube-transcript";
import { Pinecone, Index } from "@pinecone-database/pinecone";
import { embed, embedMany, generateText } from "ai";
import axios from "axios";
import {
	createEmbedding,
	createEmbeddings,
	getChatModel,
	getEmbeddingModel,
	getFallbackChatModel,
} from "@/lib/ai";

const safeJson = (value: unknown) => {
	try {
		return JSON.stringify(value).slice(0, 500);
	} catch {
		return String(value);
	}
};

/** Shape of Axios error for formatting; avoids relying on axios typings. */
interface AxiosErrorLike {
	response?: { status?: number; data?: unknown };
	message: string;
}

const formatTranscriptError = (error: unknown) => {
	// Axios-like shape (response + message); avoids relying on axios typings
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		"message" in error &&
		typeof (error as AxiosErrorLike).message === "string"
	) {
		const err = error as AxiosErrorLike;
		const status = err.response?.status;
		const data = err.response?.data;
		return `AxiosError status=${status ?? "unknown"} message=${err.message} data=${safeJson(data)}`;
	}
	if (error instanceof Error) {
		return `${error.name}: ${error.message}`;
	}
	return String(error);
};

const generateTextWithFallback = async (prompt: string) => {
	try {
		return await generateText({
			model: getChatModel(),
			prompt,
		});
	} catch (error) {
		console.warn(
			"Primary chat model failed, retrying with fallback:",
			error,
		);
		return await generateText({
			model: getFallbackChatModel(),
			prompt,
		});
	}
};

export interface transcriptInterface {
	text: string;
	duration: number;
	offset: number;
	lang: string;
}

interface ChunkData {
	id: string;
	video_id: string;
	text: string;
	startTime: number;
	endTime: number;
	vector: number[];
}

interface PineconeVector {
	id: string;
	values: number[];
	metadata: {
		video_id: string;
		text: string;
		startTime: number;
		endTime: number;
	};
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const TACTIQ_TRANSCRIPT_HEADERS: Record<string, string> = {
	accept: "*/*",
	"accept-language": "en-US,en;q=0.9",
	"content-type": "application/json",
	origin: "https://tactiq.io",
	referer: "https://tactiq.io/",
	"sec-ch-ua":
		'"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
	"sec-ch-ua-mobile": "?0",
	"sec-ch-ua-platform": '"macOS"',
	"sec-fetch-dest": "empty",
	"sec-fetch-mode": "cors",
	"sec-fetch-site": "same-site",
	"user-agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
};

export async function fetchTranscript2(
	videoUrl: string,
): Promise<transcriptInterface[] | null> {
	try {
		const langCode = "en";

		console.info("[transcript] tactiq fetch start", { videoUrl, langCode });

		const headers = { ...TACTIQ_TRANSCRIPT_HEADERS };
		const appCheckToken = process.env.TACTIQ_APPCHECK_TOKEN;
		if (appCheckToken) {
			headers["x-firebase-appcheck"] = appCheckToken;
		}

		// Make request to tactiq API (same as: curl 'https://tactiq-apps-prod.tactiq.io/transcript' ...)
		const response: {
			data: {
				title: string;
				captions: { text: string; dur: string; start: string }[];
			};
		} = await axios.post(
			"https://tactiq-apps-prod.tactiq.io/transcript",
			{ videoUrl, langCode },
			{ headers },
		);

		// Transform the response
		const transformedCaptions = response?.data?.captions?.map(
			(caption: { text: string; dur: string; start: string }) => ({
				text: caption.text,
				duration: parseFloat(caption.dur),
				offset: parseFloat(caption.start),
				lang: langCode,
			}),
		);

		if (!transformedCaptions || transformedCaptions.length === 0) {
			console.warn("[transcript] tactiq returned empty", { videoUrl });
			return null;
		}

		console.info("[transcript] tactiq success", {
			videoUrl,
			segments: transformedCaptions.length,
		});

		return transformedCaptions;
	} catch (transcriptError: unknown) {
		console.error("[transcript] tactiq failed", {
			videoUrl,
			error: formatTranscriptError(transcriptError),
		});
		return null;
	}
}

function formatYoutubeTranscript(
	transcript: { text: string; duration: number; offset: number; lang?: string }[],
): transcriptInterface[] {
	return transcript.map((item) => ({
		text: item.text,
		duration: item.duration,
		offset: item.offset,
		lang: item.lang || "en",
	}));
}

export async function fetchTranscripts(
	video_id: string,
): Promise<transcriptInterface[]> {
	const tryFetch = async (config?: { lang: string }) => {
		const transcript = await YoutubeTranscript.fetchTranscript(
			video_id,
			config,
		);
		if (!transcript || transcript.length === 0) return null;
		return formatYoutubeTranscript(transcript);
	};

	try {
		console.info("[transcript] youtube-transcript fetch start", { video_id });

		// Prefer English; if empty or language not available, use first available track
		let formatted: transcriptInterface[] | null = await tryFetch({
			lang: "en",
		});

		if (!formatted) {
			console.warn(
				"[transcript] youtube-transcript en returned empty, trying default track",
				{ video_id },
			);
			formatted = await tryFetch(undefined);
		}

		if (!formatted || formatted.length === 0) {
			console.warn("[transcript] youtube-transcript returned empty", {
				video_id,
			});
			throw new Error("youtube-transcript returned empty");
		}

		console.info("[transcript] youtube-transcript success", {
			video_id,
			segments: formatted.length,
		});

		return formatted;
	} catch (transcriptError: unknown) {
		// If English isn't available, retry without lang to use first available track
		if (transcriptError instanceof YoutubeTranscriptNotAvailableLanguageError) {
			console.warn(
				"[transcript] youtube-transcript en not available, trying default track",
				{ video_id },
			);
			try {
				const transcript = await YoutubeTranscript.fetchTranscript(
					video_id,
					undefined,
				);
				if (transcript?.length) {
					const formatted = formatYoutubeTranscript(transcript);
					console.info("[transcript] youtube-transcript success (default)", {
						video_id,
						segments: formatted.length,
					});
					return formatted;
				}
			} catch {
				// fall through to original error
			}
		}

		const details = formatTranscriptError(transcriptError);
		console.error("[transcript] youtube-transcript failed", {
			video_id,
			error: details,
		});
		throw new Error(`youtube-transcript failed: ${details}`);
	}
}

export async function fetchTranscriptWithFallback(options: {
	videoUrl?: string;
	videoId?: string;
}): Promise<transcriptInterface[] | null> {
	const useTactiq = process.env.TRANSCRIPT_PROVIDER === "tactiq";
	if (useTactiq && options.videoUrl) {
		const primary = await fetchTranscript2(options.videoUrl);
		if (primary && primary.length > 0) {
			return primary;
		}
	}

	if (options.videoId) {
		try {
			return await fetchTranscripts(options.videoId);
		} catch (err) {
			// If youtube-transcript failed, try Tactiq when videoUrl is available
			if (options.videoUrl) {
				console.info(
					"[transcript] youtube-transcript failed, trying Tactiq fallback",
					{ videoUrl: options.videoUrl },
				);
				const tactiq = await fetchTranscript2(options.videoUrl);
				if (tactiq && tactiq.length > 0) return tactiq;
				throw new Error(
					"Transcript not available: youtube-transcript failed and Tactiq returned empty",
				);
			}
			throw err;
		}
	}

	return null;
}

export const initializePinecone = async () => {
	const pinecone = new Pinecone({
		apiKey: process.env.PINECONE_API_KEY!,
	});

	// await pinecone.init({
	//   environment: "YOUR_ENVIRONMENT", // Replace with your Pinecone environment
	//   apiKey: "YOUR_API_KEY", // Replace with your Pinecone API key
	// });
	const indexName = process.env.PINECONE_INDEX || "youtube-content";
	return pinecone.Index(indexName);
};
export const preprocessTranscript = async (
	transcript: transcriptInterface[],
	chunkSize = 300,
): Promise<
	{ text: string; startTime: number | null; endTime: number | null }[]
> => {
	const chunks: {
		text: string;
		startTime: number | null;
		endTime: number | null;
	}[] = [];
	let currentChunk = {
		text: "",
		startTime: null as number | null,
		endTime: null as number | null,
	};

	transcript.forEach((item, index) => {
		if (!currentChunk.startTime)
			currentChunk.startTime = item.offset as number;

		currentChunk.text += (currentChunk.text ? " " : "") + item.text;
		currentChunk.endTime = (item.offset + item.duration) as number;

		if (
			currentChunk.text.split(" ").length >= chunkSize ||
			index === transcript.length - 1
		) {
			chunks.push({ ...currentChunk });
			currentChunk = { text: "", startTime: null, endTime: null };
		}
	});
	return chunks;
};

export const generateEmbeddings = async (
	chunks: {
		text: string;
		startTime: number | null;
		endTime: number | null;
	}[],
	video_id: string,
) => {
	const results: ChunkData[] = [];
	const batchSize = 50;

	for (let i = 0; i < chunks.length; i += batchSize) {
		const batch = chunks.slice(i, i + batchSize);
		try {
			const embeddings = await createEmbeddings(
				batch.map((chunk) => chunk.text)
			);

			embeddings.forEach((embedding, batchIndex) => {
				const chunk = batch[batchIndex];
				results.push({
					id: `${video_id}-chunk-${i + batchIndex}`,
					video_id: video_id,
					text: chunk.text,
					startTime: chunk.startTime as number,
					endTime: chunk.endTime as number,
					vector: embedding,
				});
			});
		} catch (error) {
			console.error(
				`Error generating embeddings for batch starting at index ${i}:`,
				error,
			);
		}
	}

	return results;
};

export const upsertChunksToPinecone = async (
	index: Index,
	chunks: ChunkData[],
) => {
	// Ensure vectors is an array and matches Pinecone's expected format
	console.log("Upserting chunks to Pinecone");
	const vectors: PineconeVector[] = chunks.map((chunk) => ({
		id: chunk.id,
		values: Array.from(chunk.vector), // Convert to regular array if it's not already
		metadata: {
			video_id: chunk.video_id,
			text: chunk.text,
			startTime: chunk.startTime,
			endTime: chunk.endTime,
		},
	}));
	console.log("Vectors created");
	// Upsert in batches of 100 to avoid rate limits
	const batchSize = 100;
	for (let i = 0; i < vectors.length; i += batchSize) {
		try {
			const batch = vectors.slice(i, i + batchSize);
			const namespace = process.env.PINECONE_NAMESPACE || "videosage-namespace-3";
			await index.namespace(namespace).upsert(batch);
		} catch (error) {
			console.error(
				`Error upserting batch starting at index ${i}:`,
				error,
			);
		}
	}
	console.log("Chunks upserted");
};

export const summarizeChunks = async (transcripts: string) => {
	const prompt = `You are an expert content summarizer specializing in creating comprehensive, well-structured video summaries. Create a detailed summary of this YouTube video transcript that is both informative and easy to read.

    **Summary Structure:**

    1. **Overview** (2-3 sentences)
    - Provide a concise introduction to the main topic/purpose
    - Highlight the key takeaway

    2. **Key Topics Covered**
    - Break down major topics into clear sections
    - Use bullet points for important subtopics
    - Maintain logical flow from basic to advanced concepts

    3. **Main Points & Insights**
    - Present detailed explanations of core concepts
    - Include any significant examples or case studies
    - Highlight practical applications or recommendations

    4. **Technical Details** (if applicable)
    - List any tools, technologies, or methodologies discussed
    - Include specific steps, processes, or implementations
    - Note any best practices or guidelines mentioned

    5. **Key Takeaways**
    - Summarize 3-5 most important learnings
    - Include any concluding thoughts or recommendations

    **Formatting Guidelines:**
    * Use clear headings and subheadings
    * Implement proper spacing between sections
    * Use bullet points and numbered lists for better readability
    * Keep paragraphs concise (3-4 sentences maximum)
    * Bold important terms or concepts
    * Use markdown formatting for better structure

    **Important Notes:**
    * Aim for approximately 500-700 words
    * Focus on accuracy and completeness
    * Maintain a professional, educational tone
    * Avoid repetition and filler content
    * Do not include timestamps or references to the video format
    * Do not use introductory phrases like "In this video" or "The speaker discusses"

    Please provide a clear, comprehensive summary following these guidelines.`;

	const { text } = await generateTextWithFallback(
		`${prompt}\n\n${transcripts}`,
	);
	return text;
};

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
                        "hint": "It's related to a paradigm focusing on 'objects.'",
                        "answer": "Object-Oriented Programming.",
                        "explanation": "OOP is a programming paradigm based on the concept of objects containing data and methods for data manipulation.",
                        "source": "N/A"
                      }
                    ]
                  }
                  Always format your response in JSON for consistency.
  `;
	const { text } = await generateTextWithFallback(
		`${prompt}\n\n${transcripts}`,
	);
	return text;
};

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
                }`;
	const { text } = await generateTextWithFallback(
		`${prompt}\n\n${transcripts}`,
	);
	return text;
};

export const generateMindMap = async (transcripts: string) => {
	const prompt = `You are an AI designed to generate hierarchical mind maps from YouTube transcripts. Your output MUST be valid JSON format that is compatible with GoJS.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no explanations, no extra text
2. Ensure all strings are properly escaped and quoted
3. Do not include any line breaks within JSON string values
4. Use proper JSON syntax throughout
5. ENSURE THE JSON IS COMPLETE - do not cut off mid-way
6. Keep node text concise (max 50 characters)
7. Generate maximum 15-20 nodes to ensure complete response

The JSON structure should contain:
1. "nodes" array with objects having: key (number), text (string), category (string)
2. "links" array with objects having: from (number), to (number)

Categories should be: "root", "section", "topic", "subtopic"

Example format:
{
  "nodes": [
    {"key": 1, "text": "Main Topic", "category": "root"},
    {"key": 2, "text": "Section 1", "category": "section"},
    {"key": 3, "text": "Subtopic A", "category": "topic"}
  ],
  "links": [
    {"from": 1, "to": 2},
    {"from": 2, "to": 3}
  ]
}

Generate a comprehensive but concise mindmap covering the key points from the video transcript. Keep it focused and complete.`;

	let attempts = 0;
	const maxAttempts = 3;

	while (attempts < maxAttempts) {
		try {
			const { text } = await generateTextWithFallback(
				`${prompt}\n\n${transcripts}`,
			);
			const response = text;

			// Basic validation that response contains JSON structure
			if (
				response &&
				response.includes('"nodes"') &&
				response.includes('"links"')
			) {
				return response;
			}

			throw new Error("Response doesn't contain expected JSON structure");
		} catch (error) {
			attempts++;
			console.error(
				`Attempt ${attempts} failed for mindmap generation:`,
				error,
			);

			if (attempts >= maxAttempts) {
				console.error("All attempts failed, returning fallback");
				// Return a basic JSON structure as fallback
				return JSON.stringify({
					nodes: [
						{ key: 1, text: "Video Content", category: "root" },
						{ key: 2, text: "Main Topics", category: "section" },
						{ key: 3, text: "Key Points", category: "topic" },
					],
					links: [
						{ from: 1, to: 2 },
						{ from: 2, to: 3 },
					],
				});
			}

			// Wait before retry
			await new Promise((resolve) =>
				setTimeout(resolve, 1000 * attempts),
			);
		}
	}
};

export async function queryPineconeVectorStore(
	client: Pinecone,
	indexname: string,
	namespace: string,
	video_id: string,
	searchQuery: string,
): Promise<string> {
	console.log("Querying Pinecone vector store");
	const queryEmbedding = await createEmbedding(searchQuery);
	console.log("Query embedding generated");
	const index = client.index(indexname);
	console.log("Index fetched");
	console.log("Querying Pinecone vector store");
	const queryResponse = await index.namespace(namespace).query({
		topK: 5,
		vector: queryEmbedding,
		includeMetadata: true,
		includeValues: false,
		filter: {
			video_id: { $eq: video_id },
		},
	});
	console.log("Query response fetched");
	if (queryResponse.matches.length > 0) {
		const concatRetrievals = queryResponse.matches
			.map((match, idx) => {
				return `\n Transcript chunks findings ${idx + 1}: \n ${match.metadata?.text} \n chunk timestamp startTime: ${match.metadata?.startTime} & endTime: ${match.metadata?.endTime}`;
			})
			.join(`\n\n`);
		console.log("Concatenated retrievals");
		return concatRetrievals;
	} else {
		console.log("No match found");
		return "<no match>";
	}
}
