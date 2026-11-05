import AsyncHandler from "../utils/AsyncHandler.js";
import AppError from "../utils/ApiError.js";

/**
 * Authentication middleware for Agent service
 * Verifies user identification from gateway header (x-user-id)
 */
export const protect = AsyncHandler(async (req, res, next) => {
  const userId = req.headers["x-user-id"] || req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized: Missing user authentication", 401);
  }

  req.user = { id: userId, _id: userId };
  next();
});
