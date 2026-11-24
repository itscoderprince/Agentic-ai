import getModel from "../configs/llmModels.js";
import { extractText } from "../utils/textUtils.js";

export const chatAgent = async (state) => {
  const llm = getModel("chat");

  const systemPrompt = `You are Agentic AI, an advanced, highly intelligent, and engaging AI assistant.

Formatting & Style Guidelines:
- Write in a natural, polished, and structured style like top AI assistants (ChatGPT, Claude).
- Use clear markdown hierarchy: subheadings (###), bold key phrases, and organized bullet points.
- Do NOT default to markdown tables unless the user explicitly asks for a table or when presenting direct numerical data.
- For recommendations, travel destinations, guides, or explanations, use rich narrative sections with vivid details and practical tips.
- Maintain an insightful, warm, and highly professional tone.`;

  try {
    // Format conversation history from memory state
    let history = (state.messages || [])
      .filter((m) => m && m.content && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    // If current prompt was already saved as last item in history, exclude to avoid duplicating
    if (
      history.length &&
      history[history.length - 1].role === "user" &&
      history[history.length - 1].content === state.prompt
    ) {
      history = history.slice(0, -1);
    }

    // Keep the last 10 messages for prompt token efficiency
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
    console.error("Chat agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while processing your request.",
    };
  }
};
