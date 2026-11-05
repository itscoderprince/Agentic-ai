import express from "express";
import { runAgent } from "../controller/agent.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply protect to all agent routes
router.use(protect);

router.post("/", runAgent);

export default router;
