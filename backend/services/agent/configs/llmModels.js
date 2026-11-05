import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogle } from "@langchain/google";
import { ChatDeepSeek } from "@langchain/deepseek";

// 1. Groq (Pro Flagship: "openai/gpt-oss-120b" | "llama-3.3-70b-versatile")
export const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 2,
});

// 2. Google Gemini (Pro / Flash: "gemini-2.5-flash" | "gemini-2.5-pro")
export const google = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
  temperature: 0,
  maxRetries: 2,
});

// 3. DeepSeek (Pro Reasoning: "deepseek/deepseek-r1" | "deepseek-reasoner")
const isOpenRouter = process.env.DEEPSEEK_API_KEY?.startsWith("sk-or-");
export const deepseek = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model:
    process.env.DEEPSEEK_MODEL ||
    (isOpenRouter ? "deepseek/deepseek-r1" : "deepseek-reasoner"),
  temperature: 0,
  maxRetries: 2,
  ...(isOpenRouter
    ? { configuration: { baseURL: "https://openrouter.ai/api/v1" } }
    : {}),
});

/**
 * Selects the optimal LLM instance based on usecase, agent type, or provider name.
 *
 * @param {string} usecase - e.g. "router", "chat", "coding", "vision", "pdf", "search", "ppt" or provider name
 * @returns {ChatGroq | ChatGoogle | ChatDeepSeek}
 */
export const getModel = (usecase = "chat") => {
  const type = String(usecase).toLowerCase().trim();

  switch (type) {
    // Coding & Complex Reasoning -> DeepSeek R1 / Reasoner
    case "coding":
    case "code":
    case "reasoning":
    case "deepseek":
      return deepseek;

    // Vision, Image OCR & Long Document PDF Analysis -> Google Gemini
    case "vision":
    case "image":
    case "pdf":
    case "document":
    case "google":
    case "gemini":
      return google;

    // Fast Classification, General Chat, Search & Slides -> Groq (Llama / GPT-OSS)
    case "router":
    case "chat":
    case "search":
    case "ppt":
    case "presentation":
    case "groq":
    default:
      return groq;
  }
};

// Default primary LLM
export const llm = groq;

// Semantic aliases
export const groqModel = groq;
export const googleModel = google;
export const deepseekModel = deepseek;

export default getModel;
