const env = require("../config/env");
const AppError = require("../utils/appError");

const verifyRequestOrigin = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin && !env.isProduction) return next();
  if (origin && env.allowedOrigins.includes(origin)) return next();
  return next(new AppError(403, "Request origin is not allowed", "ORIGIN_REJECTED"));
};

const requireIntegration = (name) => (req, res, next) => {
  const configured = {
    razorpay: env.razorpayConfigured,
    cloudinary: env.cloudinaryConfigured,
    email: env.emailConfigured,
    google: env.googleConfigured
  }[name];
  return configured ? next() : next(new AppError(503, `${name} integration is not configured`, "INTEGRATION_UNAVAILABLE"));
};

module.exports = { verifyRequestOrigin, requireIntegration };
