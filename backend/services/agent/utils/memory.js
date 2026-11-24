import redis from "../../../shared/redis/redis.js";

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days session retention
const MAX_MEMORY_MESSAGES = 15; // Retains last 10–15 messages in Redis for bounded RAM efficiency

/**
 * Retrieves conversation memory from Redis cache (<1ms).
 * If cache miss occurs, falls back to fetching from Chat Service and hydrates Redis.
 */
export const getMemory = async (conversationId, userId) => {
  if (!conversationId) return [];

  const key = `messages-${conversationId}`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Redis getMemory error:", err.message);
  }

  // Cache miss: fetch messages from Chat microservice
  try {
    const chatServiceUrl = process.env.CHAT_SERVICE || "http://localhost:3000";
    const headers = userId ? { "x-user-id": userId } : {};
    const res = await fetch(`${chatServiceUrl}/conversations/${conversationId}/messages`, {
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      const messages = data.data?.messages || data.messages || [];
      if (Array.isArray(messages) && messages.length > 0) {
        const trimmed = messages.slice(-MAX_MEMORY_MESSAGES);
        await redis.set(key, JSON.stringify(trimmed), "EX", TTL_SECONDS);
        return trimmed;
      }
    }
  } catch (err) {
    console.error("Failed to fetch messages from chat service:", err.message);
  }

  return [];
};

/**
 * Stores messages array in Redis cache with TTL (capped to latest 10–15 messages).
 */
export const setMemory = async (conversationId, messages) => {
  if (!conversationId || !messages) return;

  const key = `messages-${conversationId}`;
  const bounded = Array.isArray(messages) ? messages.slice(-MAX_MEMORY_MESSAGES) : messages;
  try {
    await redis.set(key, JSON.stringify(bounded), "EX", TTL_SECONDS);
  } catch (err) {
    console.error("Redis setMemory error:", err.message);
  }
};

/**
 * Appends new message(s) to conversation memory in Redis without duplicates (keeps latest 10–15).
 */
export const appendMemory = async (conversationId, newMessages) => {
  if (!conversationId || !newMessages) return [];

  const existing = (await getMemory(conversationId)) || [];
  const toAdd = Array.isArray(newMessages) ? newMessages : [newMessages];

  const updated = [...existing];
  for (const msg of toAdd) {
    const isDuplicate =
      updated.length > 0 &&
      updated[updated.length - 1].role === msg.role &&
      updated[updated.length - 1].content === msg.content;
    if (!isDuplicate) {
      updated.push(msg);
    }
  }

  const bounded = updated.slice(-MAX_MEMORY_MESSAGES);
  await setMemory(conversationId, bounded);
  return bounded;
};

/**
 * Clears conversation memory key from Redis.
 */
export const clearMemory = async (conversationId) => {
  if (!conversationId) return;

  const key = `messages-${conversationId}`;
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis clearMemory error:", err.message);
  }
};

export default { getMemory, setMemory, appendMemory, clearMemory };
