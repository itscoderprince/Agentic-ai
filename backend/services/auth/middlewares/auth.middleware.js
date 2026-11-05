import { getAuth } from "firebase-admin/auth";
import { app } from "../configs/firebase.js";
import redis from "../../../shared/redis/redis.js";
import User from "../model/user.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import AppError from "../utils/ApiError.js";

const auth = getAuth(app);
const SESSION_EXPIRY = Number(process.env.SESSION_EXPIRY) || 604800000;

export const protect = AsyncHandler(async (req, res, next) => {
  const sessionCookie = req.cookies?.session;

  if (!sessionCookie) {
    throw new AppError("Unauthorized: No session cookie provided", 401);
  }

  // 1. Verify session cookie signature locally (< 1ms)
  let decoded;
  try {
    decoded = await auth.verifySessionCookie(sessionCookie, false);
  } catch {
    throw new AppError("Unauthorized: Invalid or expired session", 401);
  }

  // 2. Instant Redis revocation check (< 1ms)
  try {
    const cachedSession = await redis.get(`session:${decoded.uid}`);
    if (!cachedSession || cachedSession !== sessionCookie) {
      throw new AppError("Unauthorized: Session has been revoked or expired", 401);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
  }

  // 3. Fast-path: Read cached user from Redis
  try {
    const cachedUser = await redis.get(`user:${decoded.uid}`);
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      req.authSource = "redis";
      return next();
    }
  } catch {
    // If Redis read fails, fall through to MongoDB
  }

  // 4. Fallback: Query MongoDB
  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userData = {
    id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };

  // Populate Redis cache for future requests
  try {
    await redis.set(`user:${decoded.uid}`, JSON.stringify(userData), "PX", SESSION_EXPIRY);
  } catch {
    // Non-blocking
  }

  req.user = userData;
  req.authSource = "database";
  next();
});

