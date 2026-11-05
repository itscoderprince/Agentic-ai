import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { visionAgent } from "../agents/vision.agent.js";

const agents = {
  chat: chatAgent,
  search: searchAgent,
  coding: codingAgent,
  pdf: pdfAgent,
  ppt: pptAgent,
  vision: visionAgent,
};

const workflow = new StateGraph(AgentState);

// Router node
workflow.addNode("router", router);
workflow.addEdge(START, "router");

// Register agent nodes and route completion to END
Object.entries(agents).forEach(([name, agentFn]) => {
  workflow.addNode(name, agentFn);
  workflow.addEdge(name, END);
});

// Conditional routing from router to selected agent (defaults to 'chat')
workflow.addConditionalEdges("router", (state) => {
  return agents[state.agent] ? state.agent : "chat";
});

export const agentGraph = workflow.compile();
export { workflow };
