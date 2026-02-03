import { createOpenAI } from "@ai-sdk/openai";

const requireEnv = (key: string) => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`${key} is not defined`);
	}
	return value;
};

let openaiClient: ReturnType<typeof createOpenAI> | null = null;

export const getOpenAIClient = () => {
	if (!openaiClient) {
		openaiClient = createOpenAI({
			apiKey: requireEnv("OPENAI_API_KEY"),
		});
	}
	return openaiClient;
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
	getOpenAIClient().embeddingModel(getEmbeddingModelId());
