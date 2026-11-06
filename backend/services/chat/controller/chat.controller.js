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
  const conversation = await Conversation.create({
    userId: req.user.id,
    title: req.validated.title,
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

  const conversation = await Conversation.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: req.validated },
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
 * Delete a conversation and cascade delete its messages
 * DELETE /conversations/:id
 */
export const deleteConversation = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await Conversation.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  // Cascade delete all messages in this conversation to avoid orphaned records
  await Message.deleteMany({ conversationId: id });

  return sendResponse(res, 200, true, "Conversation deleted successfully");
});

/**
 * Save messages to a conversation (supports single message or batch array)
 * POST /conversations/:id/messages
 */
export const saveMessages = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Verify conversation ownership
  const conversation = await Conversation.findOne({
    _id: id,
    userId: req.user.id,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  // 2. Attach conversationId to validated & normalized messages
  const docs = req.validated.map((m) => ({
    conversationId: id,
    role: m.role,
    content: m.content,
  }));

  const saved = await Message.insertMany(docs);

  // 3. Bump conversation updatedAt timestamp
  await Conversation.updateOne({ _id: id }, { $set: { updatedAt: new Date() } });

  return sendResponse(res, 201, true, "Message(s) saved successfully", {
    messages: saved,
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
