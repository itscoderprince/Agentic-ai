import express from "express";
import {
  createConversation,
  getConversations,
  updateConversation,
  saveMessages,
  getMessages,
} from "../controller/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply protect to all chat routes (attaches req.user or throws 401)
router.use(protect);

// Conversation management
router.post("/conversations", createConversation);
router.get("/conversations", getConversations);
router.patch("/conversations/:id", updateConversation);

// Message management
router.post("/conversations/:id/messages", saveMessages);
router.get("/conversations/:id/messages", getMessages);

export default router;
