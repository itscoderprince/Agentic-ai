
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./configs/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import loginRouter from "./routes/auth.route.js";
import { connectRedis } from "../../shared/redis/redis.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🔐 Auth is working" });
});

// Routes
app.use("/", loginRouter);

// Error handlers (keep these after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 2000;

const connection = await connectDB();

if (connection) {
  const redisConnection = await connectRedis();

  if (redisConnection) {
    app.listen(PORT, () => {
      console.log(`🔐 Auth Server is running on PORT: ${PORT}`);
    });
  }
}

export default app;
