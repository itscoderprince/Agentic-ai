import { agentGraph } from "../graph/graph.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import sendResponse from "../utils/sendResponse.js";

/**
 * Execute the multi-agent pipeline
 * POST /
 */
export const runAgent = AsyncHandler(async (req, res) => {
  const { prompt, conversationId } = req.validated;

  const result = await agentGraph.invoke({ prompt });

  return sendResponse(res, 200, true, "Agent executed successfully", {
    conversationId,
    agent: result.agent,
    response: result.aiResponse,
  });
});

export { runAgent as agent };
