import getModel from "../configs/llmModels.js";
import { extractText } from "../utils/textUtils.js";

export const pdfAgent = async (state) => {
  const llm = getModel("pdf");

  const systemPrompt = `You are Agentic AI Document & PDF Analysis Specialist.
Your mission:
- Extract, synthesize, and explain document content with precision.
- Provide clear summaries, key takeaways, and answer detailed document queries.`;

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
    console.error("PDF agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while analyzing the document.",
    };
  }
};

export default pdfAgent;
