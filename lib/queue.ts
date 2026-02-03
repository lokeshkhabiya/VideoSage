import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

// BullMQ requires maxRetriesPerRequest: null for blocking commands (workers)
const connectionOptions = { maxRetriesPerRequest: null } as const;

export const connection = redisUrl
  ? new IORedis(redisUrl, connectionOptions)
  : new IORedis({
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379),
      ...connectionOptions,
    });

export const contentQueue = new Queue("content-processing", {
  connection,
});
