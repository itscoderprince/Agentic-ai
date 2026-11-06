import express from "express";
import { login, logout } from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;
