import getModel from "../configs/llmModels.js";
import { extractText } from "../utils/textUtils.js";

export const searchAgent = async (state) => {
  const llm = getModel("search");

  const systemPrompt = `You are Agentic AI Search & Real-Time Intelligence Specialist.
Your mission:
- Answer queries requiring factual information, geography, travel, current knowledge, climate, and news with high accuracy.
- If the user asks for real-time live data (e.g., exact live temperature or stock ticker right this minute), explain the current standard conditions, timezone calculation, seasonal weather patterns, and offer practical, actionable insights.
- Format responses cleanly with markdown subheadings (###), bullet points, and clear explanations.`;

  try {
    let history = (state.messages || [])
      .filter((m) => m && m.content && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    if (
      history.length &&
      history[history.length - 1].role === "user" &&
      history[history.length - 1].content === state.prompt
    ) {
      history = history.slice(0, -1);
    }

    if (history.length > 10) {
      history = history.slice(-10);
    }

    const response = await llm.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
      {
        role: "user",
        content: state.prompt,
      },
    ]);

    return {
      aiResponse: extractText(response.content),
    };
  } catch (error) {
    console.error("Search agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while searching for that information.",
    };
  }
};

export default searchAgent;
