import getModel from "../configs/llmModels.js";
import { extractText } from "../utils/textUtils.js";

export const codingAgent = async (state) => {
  const llm = getModel("coding");

  const systemPrompt = `You are Agentic AI Senior Software Engineer, an elite programming and software architecture specialist.
Guidelines:
- Provide high-performance, clean, and idiomatic code with concise explanations.
- Always wrap code inside proper markdown code blocks with the exact language identifier (e.g. \`\`\`javascript, \`\`\`python, \`\`\`typescript, \`\`\`html).
- Focus on modern best practices, readability, error handling, and security.`;

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
    console.error("Coding agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while writing the code.",
    };
  }
};

export default codingAgent;
