import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  connectTimeout: 10000,
  maxRetriesPerRequest: 3,
  retryStrategy: (attempt) => Math.min(attempt * 500, 5000),
});

redis.on("ready", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

export async function connectRedis() {
  try {
    if (redis.status === "wait") {
      await redis.connect();
    }

    await redis.ping();
    return redis;
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    return null;
  }
}

export default redis;
