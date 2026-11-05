import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  prompt: Annotation(),
  agent: Annotation(),
  aiResponse: Annotation(),
});

export { AgentState as agentState };
