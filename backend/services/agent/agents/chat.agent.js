import getModel from "../configs/llmModels.js";

export const chatAgent = async (state) => {
  const llm = getModel("chat");

  const systemPrompt =
    "You are Agentic AI, a helpful, intelligent, and concise AI assistant.";

  try {
    const response = await llm.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: state.prompt,
      },
    ]);

    return {
      aiResponse:
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content),
    };
  } catch (error) {
    console.error("Chat agent error:", error.message);
    return {
      aiResponse: "Sorry, I encountered an error while processing your request.",
    };
  }
};
