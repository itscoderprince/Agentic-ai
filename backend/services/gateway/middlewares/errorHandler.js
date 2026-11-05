import AppError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let error =
    err instanceof Error
      ? err
      : err && typeof err === "object"
        ? Object.assign(new Error(err.message ?? "Unknown error"), err)
        : new Error(String(err));

  if (error.name === "CastError") {
    error = new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors ?? {}).map(({ message }) => message);
    error = new AppError(messages.join(", ") || "Validation failed", 400);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue ?? error.keyPattern ?? {})[0];
    error = new AppError(
      field ? `Duplicate value for field: ${field}` : "Duplicate value",
      409,
    );
  }

  if (error.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
  }
  if (error.name === "TokenExpiredError") {
    error = new AppError("Token expired. Please log in again.", 401);
  }

  const statusCode =
    Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599
      ? error.statusCode
      : Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
        ? error.status
        : 500;
  const isOperational = error.isOperational === true || statusCode < 500;
  const message =
    statusCode < 500 || (isOperational && process.env.NODE_ENV === "development")
      ? error.message
      : "Internal Server Error";

  if (!isOperational) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler