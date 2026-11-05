import { app } from "../configs/firebase.js";
import User from "../model/user.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import AppError from "../utils/ApiError.js";
import sendResponse from "../utils/sendResponse.js";
import { getAuth } from "firebase-admin/auth";
import redis from "../../../shared/redis/redis.js";

const auth = getAuth(app);

const SESSION_EXPIRY = Number(process.env.SESSION_EXPIRY) || 604800000;

// Login func
export const login = AsyncHandler(async (req, res) => {
  const token = req.body?.token;

  if (typeof token !== "string" || !token.trim()) {
    throw new AppError("Firebase ID token is required", 400);
  }

  const decoded = await auth.verifyIdToken(token.trim());

  // Find user in MongoDB
  let user = await User.findOne({
    firebaseUid: decoded.uid,
  });

  // Create user if not already registered
  if (!user) {
    user = await User.create({
      firebaseUid: decoded.uid,
      name: decoded.name || decoded.displayName || "User",
      email: decoded.email,
      avatar: decoded.picture || decoded.photoURL || "",
    });
  }

  // Create Firebase session cookie
  const sessionCookie = await auth.createSessionCookie(token, {
    expiresIn: SESSION_EXPIRY,
  });

  const userData = {
    id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };

  // Cache session and user in Redis (fast in-memory lookup)
  try {
    await redis.set(`session:${decoded.uid}`, sessionCookie, "PX", SESSION_EXPIRY);
    await redis.set(`user:${decoded.uid}`, JSON.stringify(userData), "PX", SESSION_EXPIRY);
  } catch (err) {
    console.error("Redis write error:", err.message);
  }

  // Set secure session cookie
  res.cookie("session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY,
    path: "/",
  });

  // Send response
  return sendResponse(res, 200, true, "Login successful", {
    source: "database",
    user: userData,
  });
});

// LogOut func
export const logout = AsyncHandler(async (req, res) => {
  const sessionCookie = req.cookies?.session;

  res.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  if (!sessionCookie) {
    return sendResponse(res, 200, true, "Logout successful");
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, false);

    // Evict session and cached user from Redis
    await redis.del(`session:${decoded.uid}`, `user:${decoded.uid}`);

    // Invalidate refresh tokens in Firebase
    await auth.revokeRefreshTokens(decoded.uid);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Logout error:", error.message);
    }
  }

  return sendResponse(res, 200, true, "Logout successful");
});

// Get Current Authenticated User func
export const getMe = AsyncHandler(async (req, res) => {
  return sendResponse(
    res,
    200,
    true,
    `Authenticated user retrieved from ${req.authSource === "redis" ? "Redis cache" : "MongoDB database"}`,
    {
      source: req.authSource,
      user: req.user,
    }
  );
});
