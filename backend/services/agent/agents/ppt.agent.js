import getModel from "../configs/llmModels.js";
import { extractText } from "../utils/textUtils.js";

export const pptAgent = async (state) => {
  const llm = getModel("ppt");

  const systemPrompt = `You are Agentic AI Presentation Specialist.
Your mission:
- Create structured, high-impact slide outlines, pitch decks, and presentation blueprints.
- Format each slide clearly with:
  ### Slide [Number]: [Title]
  - **Key Message / Takeaway**
  - **Bullet Points / Data**
  - **Speaker Notes**`;

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
    console.error("PPT agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while generating the presentation outline.",
    };
  }
};

export default pptAgent;
