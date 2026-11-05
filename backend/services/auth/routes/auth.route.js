import express from "express";
import { login, logout, getMe } from "../controller/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
