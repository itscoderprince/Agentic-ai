import "dotenv/config";
import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import proxyWithHeader from "./utils/proxyWithHeader.js";
import { connectRedis } from "../../shared/redis/redis.js";
import verifyGatewayAuth from "./middlewares/auth.middleware.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();

// 1. CORS must be first so preflight and headers work
const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);

// 2. Gateway Edge Endpoints
// Instant session hydration (< 1ms from Redis RAM without waking Auth service)
app.get("/auth/me", verifyGatewayAuth, (req, res) => {
  return res.status(200).json({
    user: req.user,
    success: true,
    message: "Authenticated user retrieved from Gateway Redis cache",
  });
});

// 3. Proxy routes before body-parser so the stream isn't consumed
// Public Auth Service routes (Google Login, Logout)
app.use("/auth", proxy(process.env.AUTH_SERVICE));

// Protected microservice routes (Protected by Gateway Auth Guard)
app.use("/chat", verifyGatewayAuth, proxyWithHeader(process.env.CHAT_SERVICE));
app.use("/agent", verifyGatewayAuth, proxyWithHeader(process.env.AGENT_SERVICE));

// 4. Body parser for native gateway routes
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "🚀 Gateway Server is working" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

await connectRedis();

app.listen(PORT, () => {
  console.log(`🚀 Gateway Server is running on PORT: ${PORT}`);
});

export default app;
