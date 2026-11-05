import getModel from "../configs/llmModels.js";

export const router = async (state) => {
  if (state.agent) return { agent: state.agent };

  const llm = getModel("router");

  const prompt = `You are an expert intent router for an AI agent platform.
Analyze the user query and classify it into exactly one specialized agent:

- "chat": General conversations, greetings, casual discussions, and open-ended Q&A.
- "coding": Writing code, debugging errors, refactoring, programming syntax, software engineering.
- "search": Real-time information, web searches, current events, news, weather lookup.
- "pdf": Reading, summarizing, extracting, or analyzing PDF documents.
- "ppt": Generating presentations, slide decks, slide outlines, or pitch decks.
- "vision": Processing images, OCR, screenshots, diagrams, and multimodal visual analysis.

User Query:
"${state.prompt}"

Return ONLY the single lowercase agent name ("chat", "coding", "search", "pdf", "ppt", or "vision"). Do not include any explanation, markdown, or punctuation.`;

  try {
    const response = await llm.invoke(prompt);
    const decision = response.content?.toString().trim().toLowerCase() || "";

    const validAgents = ["chat", "coding", "search", "pdf", "ppt", "vision"];
    const agent = validAgents.find((a) => decision.includes(a)) || "chat";

    return { agent };
  } catch (error) {
    console.error("Router error, falling back to chat agent:", error.message);
    return { agent: "chat" };
  }
};
