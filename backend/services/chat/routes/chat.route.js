import express from "express";
import {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation,
  saveMessages,
  getMessages,
} from "../controller/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createConversationSchema,
  updateConversationSchema,
  saveMessagesSchema,
} from "../schemas/chat.schema.js";

const router = express.Router();

// Apply protect to all chat routes (attaches req.user or throws 401)
router.use(protect);

// Conversation management
router.post(
  "/conversations",
  validate(createConversationSchema),
  createConversation
);
router.get("/conversations", getConversations);
router.patch(
  "/conversations/:id",
  validate(updateConversationSchema),
  updateConversation
);
router.delete("/conversations/:id", deleteConversation);

// Message management
router.post(
  "/conversations/:id/messages",
  validate(saveMessagesSchema),
  saveMessages
);
router.get("/conversations/:id/messages", getMessages);

export default router;
