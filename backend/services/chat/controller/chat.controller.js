import Conversation from "../model/conversation.model.js";
import Message from "../model/message.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/ApiError.js";

/**
 * Create a new conversation
 * POST /conversations
 */
export const createConversation = AsyncHandler(async (req, res) => {
  const { title } = req.body || {};

  const conversation = await Conversation.create({
    userId: req.user.id,
    title: title || "New chat",
  });

  return sendResponse(res, 201, true, "Conversation created successfully", {
    conversation,
  });
});

/**
 * Get all conversations for the authenticated user
 * GET /conversations
 */
export const getConversations = AsyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ userId: req.user.id })
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  return sendResponse(res, 200, true, "Conversations fetched successfully", {
    conversations,
  });
});

/**
 * Update conversation (rename title, toggle isPinned)
 * PATCH /conversations/:id
 */
export const updateConversation = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, isPinned } = req.body || {};

  const updates = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);

  const conversation = await Conversation.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  return sendResponse(res, 200, true, "Conversation updated successfully", {
    conversation,
  });
});

/**
 * Save messages to a conversation (supports single message or batch array)
 * POST /conversations/:id/messages
 */
export const saveMessages = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, content, messages } = req.body || {};

  // 1. Verify conversation ownership
  const conversation = await Conversation.findOne({
    _id: id,
    userId: req.user.id,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  let saved;

  // 2. Support batch message array or single message
  if (Array.isArray(messages) && messages.length > 0) {
    const docs = messages.map((m) => ({
      conversationId: id,
      role: m.role || "user",
      content: String(m.content || "").trim(),
    }));
    saved = await Message.insertMany(docs);
  } else {
    if (!content || !String(content).trim()) {
      throw new AppError("Message content is required", 400);
    }
    saved = await Message.create({
      conversationId: id,
      role: role || "user",
      content: String(content).trim(),
    });
  }

  // 3. Bump conversation updatedAt timestamp
  await Conversation.findByIdAndUpdate(id, { $set: { updatedAt: new Date() } });

  return sendResponse(res, 201, true, "Message(s) saved successfully", {
    messages: Array.isArray(saved) ? saved : [saved],
  });
});

/**
 * Get all messages for a conversation
 * GET /conversations/:id/messages
 */
export const getMessages = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Verify conversation ownership
  const conversation = await Conversation.findOne({
    _id: id,
    userId: req.user.id,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  // 2. Fetch messages ordered chronologically
  const messages = await Message.find({ conversationId: id })
    .sort({ createdAt: 1 })
    .lean();

  return sendResponse(res, 200, true, "Messages fetched successfully", {
    messages,
  });
});
