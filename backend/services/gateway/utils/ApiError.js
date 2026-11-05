class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
      throw new RangeError("statusCode must be an HTTP error status between 400 and 599");
    }

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError