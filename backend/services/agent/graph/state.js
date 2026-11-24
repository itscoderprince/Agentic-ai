import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  prompt: Annotation(),
  agent: Annotation(),
  aiResponse: Annotation(),
  conversationId: Annotation(),
  messages: Annotation(),
  userId: Annotation(),
});

export { AgentState as agentState };
