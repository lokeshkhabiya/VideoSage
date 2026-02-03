import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

const requireEnv = (key: string) => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`${key} is not defined`);
	}
	return value;
};

let openaiClient: ReturnType<typeof createOpenAI> | null = null;
let openaiDirectClient: OpenAI | null = null;

export const getOpenAIClient = () => {
	if (!openaiClient) {
		openaiClient = createOpenAI({
			apiKey: requireEnv("OPENAI_API_KEY"),
		});
	}
	return openaiClient;
};

export const getOpenAIDirectClient = () => {
	if (!openaiDirectClient) {
		openaiDirectClient = new OpenAI({
			apiKey: requireEnv("OPENAI_API_KEY"),
		});
	}
	return openaiDirectClient;
};

export const getEmbeddingDimensions = () =>
	parseInt(process.env.EMBEDDING_DIMENSIONS || "1024");

export const createEmbeddings = async (texts: string[]) => {
	const client = getOpenAIDirectClient();
	const response = await client.embeddings.create({
		model: getEmbeddingModelId(),
		input: texts,
		dimensions: getEmbeddingDimensions(),
	});
	return response.data.map((item) => item.embedding);
};

export const createEmbedding = async (text: string) => {
	const embeddings = await createEmbeddings([text]);
	return embeddings[0];
};

export const getChatModelId = () =>
	process.env.OPENAI_CHAT_MODEL || "gpt-5-mini";

export const getFallbackChatModelId = () =>
	process.env.OPENAI_FALLBACK_CHAT_MODEL || "gpt-4o-mini";

export const getEmbeddingModelId = () =>
	process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

export const getChatModel = () => getOpenAIClient()(getChatModelId());

export const getFallbackChatModel = () =>
	getOpenAIClient()(getFallbackChatModelId());

export const getEmbeddingModel = () =>
	getOpenAIClient().embedding(getEmbeddingModelId(), {
		dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || "1024"),
	});
