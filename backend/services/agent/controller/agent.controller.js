import { agentGraph } from "../graph/graph.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { getMemory, appendMemory } from "../utils/memory.js";

/**
 * Execute the multi-agent pipeline with real-time SSE token streaming
 * POST /
 */
export const runAgent = AsyncHandler(async (req, res) => {
  const { prompt, conversationId, agent } = req.validated;
  const userId = req.user?.id;

  // 1. Set SSE streaming headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let activeAgent = agent && agent !== "auto" ? agent : "chat";
  let fullResponse = "";

  try {
    // Hydrate conversation memory from Redis cache (<1ms) or fallback to Chat Service
    const messages = conversationId ? await getMemory(conversationId, userId) : [];

    const stream = agentGraph.streamEvents(
      {
        prompt,
        conversationId,
        messages,
        userId,
        ...(agent && agent !== "auto" ? { agent } : {}),
      },
      { version: "v2" }
    );

    for await (const event of stream) {
      const node = event.metadata?.langgraph_node;

      // Track router classification
      if (node === "router" && event.event === "on_chain_end" && event.data?.output?.agent) {
        activeAgent = event.data.output.agent;
        res.write(`data: ${JSON.stringify({ type: "agent", agent: activeAgent })}\n\n`);
      }

      // Stream tokens only from specialist agents (skip internal router tokens)
      if (event.event === "on_chat_model_stream" && node !== "router") {
        const chunk = event.data?.chunk?.content;
        const text = typeof chunk === "string" ? chunk : "";
        if (text) {
          fullResponse += text;
          res.write(
            `data: ${JSON.stringify({
              type: "token",
              chunk: text,
              conversationId,
              agent: activeAgent,
            })}\n\n`
          );
        }
      }

      // Fallback: If a specialist agent completed without streaming tokens, emit its returned output
      if (node && node !== "router" && event.event === "on_chain_end") {
        const outputText = event.data?.output?.aiResponse;
        if (!fullResponse && typeof outputText === "string" && outputText.trim()) {
          fullResponse = outputText.trim();
          res.write(
            `data: ${JSON.stringify({
              type: "token",
              chunk: fullResponse,
              conversationId,
              agent: activeAgent,
            })}\n\n`
          );
        }
      }
    }

    // Persist current turn into Redis conversation memory
    if (conversationId && fullResponse) {
      await appendMemory(conversationId, [
        { role: "user", content: prompt },
        { role: "assistant", content: fullResponse },
      ]);
    }

    // Signal completion
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        fullResponse,
        conversationId,
        agent: activeAgent,
      })}\n\n`
    );
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Agent streaming error:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: error.message || "Agent execution failed",
      })}\n\n`
    );
    res.end();
  }
});

export { runAgent as agent };
