import "dotenv/config";
import { setServers } from "node:dns";
import mongoose from "mongoose";
import AsyncHandler from "../utils/AsyncHandler.js";

const connectDB = AsyncHandler(
  async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not set in the environment");
    }

    setServers(["8.8.8.8", "1.1.1.1"]);

    const connection = await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "Agentic-ai",
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    return connection;
  },
  (error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exitCode = 1;
    return null;
  },
);

export default connectDB;
