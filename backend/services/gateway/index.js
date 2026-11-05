import "dotenv/config";
import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import proxyWithHeader from "./utils/proxyWithHeader.js";
import connectDB from "./configs/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();

// 1. CORS must be first so preflight and headers work
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Proxy routes before body-parser so the stream isn't consumed
app.use("/auth", proxy(process.env.AUTH_SERVICE));
app.use("/chat", proxyWithHeader(process.env.CHAT_SERVICE));
app.use("/agent", proxyWithHeader(process.env.AGENT_SERVICE));

// 3. Body parser for native gateway routes
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "🚀 Gateway Server is working" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

const connection = await connectDB();

if (connection) {
  app.listen(PORT, () => {
    console.log(`🚀 Gateway Server is running on PORT: ${PORT}`);
  });
}

export default app;
