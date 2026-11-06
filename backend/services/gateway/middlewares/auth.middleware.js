import redis from "../../../shared/redis/redis.js";
import AppError from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";

/**
 * Gateway Authentication Guard (Edge Authentication)
 * 1. Extracts the 'session' cookie from incoming request headers
 * 2. Decodes the Firebase UID payload (< 0.1ms)
 * 3. Verifies against the Redis session cache (< 1ms)
 * 4. Injects verified req.user for proxyWithHeader to forward
 */
export const verifyGatewayAuth = AsyncHandler(async (req, res, next) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    throw new AppError("Unauthorized: Please log in to access this service", 401);
  }

  // Extract session cookie value
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  const sessionCookie = match ? decodeURIComponent(match[1]) : null;

  if (!sessionCookie) {
    throw new AppError("Unauthorized: Session cookie not found", 401);
  }

  // Fast native JWT decode (No external library needed)
  let uid;
  try {
    const parts = sessionCookie.split(".");
    if (parts.length !== 3) {
      throw new Error("Malformed JWT token structure");
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    uid = payload.uid || payload.sub || payload.user_id;

    if (!uid) {
      throw new Error("Missing UID in session token");
    }
  } catch {
    throw new AppError("Unauthorized: Invalid session token format", 401);
  }

  // Fast-path: Check Redis cache in RAM (< 1ms)
  try {
    const cachedSession = await redis.get(`session:${uid}`);

    // If session was revoked or doesn't match current cookie
    if (!cachedSession || cachedSession !== sessionCookie) {
      throw new AppError("Unauthorized: Session has expired or been revoked", 401);
    }

    // Attach cached user details (contains MongoDB _id, email, etc.)
    const cachedUser = await redis.get(`user:${uid}`);
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
    } else {
      req.user = { id: uid, firebaseUid: uid };
    }

    return next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Gateway Redis Auth error:", err.message);
    throw new AppError("Authentication verification error", 500);
  }
});

export default verifyGatewayAuth;

