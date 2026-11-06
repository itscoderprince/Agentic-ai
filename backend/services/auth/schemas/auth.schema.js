import { z } from "zod";

/**
 * Schema for user login
 * POST /login
 */
export const loginSchema = z.object({
  token: z.string().trim().min(1, "Firebase ID token is required"),
});

