import express from "express";
import { runAgent } from "../controller/agent.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { runAgentSchema } from "../schemas/agent.schema.js";

const router = express.Router();

// Apply protect to all agent routes
router.use(protect);

router.post("/", validate(runAgentSchema), runAgent);

export default router;
