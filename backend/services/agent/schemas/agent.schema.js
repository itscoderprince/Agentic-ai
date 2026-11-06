import { z } from "zod";

/**
 * Schema for executing the multi-agent pipeline
 * POST /
 */
export const runAgentSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt string is required"),
  conversationId: z.string().trim().optional(),
});

