import "dotenv/config";
import express from "express";
import cors from "cors";

import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import agentRouter from "./routes/agent.route.js";

const app = express();

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

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ message: "🤖 Agent service is healthy" });
});

// Agent routes
app.use("/", agentRouter);

// Error handlers (keep these after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🤖 Agent Server is running on PORT: http://localhost:${PORT}`);
});

export default app;
