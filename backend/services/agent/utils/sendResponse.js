const sendResponse = (
  res,
  statusCode = 200,
  success = true,
  message = "Success",
  payload = {},
) =>
  res.status(statusCode).json({
    ...payload,
    success,
    message,
  });

export default sendResponse;
