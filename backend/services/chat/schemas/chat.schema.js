import { z } from "zod";

/**
 * Schema for creating a new conversation
 * POST /conversations
 */
export const createConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : "New chat")),
});

/**
 * Schema for updating an existing conversation
 * PATCH /conversations/:id
 */
export const updateConversationSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").optional(),
    isPinned: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.isPinned !== undefined, {
    message: "At least one field (title or isPinned) must be provided for update",
  });

/**
 * Schema for a single message item
 */
const messageItemSchema = z.object({
  role: z
    .enum(["user", "assistant", "system", "tool"])
    .or(z.literal("ai").transform(() => "assistant"))
    .default("user"),
  content: z.string().trim().min(1, "Message content cannot be empty"),
});

/**
 * Schema for saving messages (supports both single message or batch array)
 * POST /conversations/:id/messages
 * Always transforms the output into a uniform array of message objects.
 */
export const saveMessagesSchema = z.union([
  z
    .object({
      messages: z
        .array(messageItemSchema)
        .min(1, "At least one message is required"),
    })
    .transform((data) => data.messages),
  messageItemSchema.transform((msg) => [msg]),
]);

