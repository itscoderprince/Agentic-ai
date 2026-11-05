const AsyncHandler = (
  fn,
  onError = (error, req, res, next) => next(error),
) => (...args) =>
  Promise.resolve()
    .then(() => fn(...args))
    .catch((error) => onError(error, ...args));

export default AsyncHandler;