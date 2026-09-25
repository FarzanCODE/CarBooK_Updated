const multer = require("multer");
const env = require("../config/env");

const notFound = (req, res) => res.status(404).json({ success: false, message: "Route not found", code: "NOT_FOUND" });

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Unexpected server error";
  let code = err.code || "SERVER_ERROR";
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : "Invalid image upload";
    code = "UPLOAD_ERROR";
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Submitted data is invalid";
    code = "VALIDATION_ERROR";
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
    code = "INVALID_ID";
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists";
    code = "DUPLICATE_VALUE";
  }
  if (statusCode >= 500) {
    console.error(err);
    if (env.isProduction) message = "Unexpected server error";
  }
  res.status(statusCode).json({ success: false, message, code });
};

module.exports = { notFound, errorHandler };
