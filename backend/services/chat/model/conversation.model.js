import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Conversation title is required"],
      trim: true,
      default: "New chat",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to fetch a user's chats fast, sorted by pinned first and most recently updated
conversationSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

const Conversation =
  mongoose.models.Conversation ??
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
