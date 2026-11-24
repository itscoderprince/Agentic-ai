import getModel from "../configs/llmModels.js";
import { extractText } from "../utils/textUtils.js";

export const visionAgent = async (state) => {
  const llm = getModel("vision");

  const systemPrompt = `You are Agentic AI Vision & Multimodal Specialist.
Your mission:
- Analyze images, charts, screenshots, diagrams, and visual inputs.
- Describe visual patterns, extract text (OCR), and provide insightful explanations.`;

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
    console.error("Vision agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while processing the visual input.",
    };
  }
};

export default visionAgent;
