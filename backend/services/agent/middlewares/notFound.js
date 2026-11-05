import AppError from "../utils/ApiError.js";

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export default notFound