import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"],
      required: [true, "Role is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast chronological conversation history retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message =
  mongoose.models.Message ?? mongoose.model("Message", messageSchema);

export default Message;
