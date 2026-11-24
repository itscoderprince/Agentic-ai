/**
 * Extracts a clean string from LangChain message content.
 * Safely handles strings, multimodal content block arrays, and raw objects.
 */
export const extractText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((item) => (typeof item === "string" ? item : item?.text || JSON.stringify(item))).join("");
  }
  return content ? JSON.stringify(content) : "";
};

/**
 * Safely parses a JSON string without throwing an exception.
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

