const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  // If headers already sent, pass to default express handler
  if (res.headersSent) {
    return next(err);
  }

  console.error("Global Error Handler Log: ", err);

  // Zod validation error handler
  if (err instanceof ZodError) {
    const fieldErrors = {};
    err.errors.forEach((validationError) => {
      const fieldName = validationError.path.join(".");
      fieldErrors[fieldName] = validationError.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: fieldErrors,
    });
  }

  // Custom errors with status code
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
