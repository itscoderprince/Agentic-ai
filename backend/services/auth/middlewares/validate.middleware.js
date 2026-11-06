import AppError from "../utils/ApiError.js";

/**
 * Reusable Zod validation middleware for Auth service
 * @param {import("zod").ZodTypeAny} schema
 * @param {"body" | "params" | "query"} [source="body"]
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const issues = result.error.issues ?? result.error.errors ?? [];
    const message =
      issues.map((issue) => issue.message).join(", ") || "Validation failed";
    throw new AppError(message, 400);
  }

  req.validated = result.data;
  next();
};

export default validate;

