import { agentGraph } from "../graph/graph.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/ApiError.js";

/**
 * Execute the multi-agent pipeline
 * POST /
 */
export const runAgent = AsyncHandler(async (req, res) => {
  const { prompt, conversationId } = req.body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new AppError("Prompt string is required", 400);
  }

  const result = await agentGraph.invoke({ prompt: prompt.trim() });

  return sendResponse(res, 200, true, "Agent executed successfully", {
    conversationId,
    agent: result.agent,
    response: result.aiResponse,
  });
});

export { runAgent as agent };
