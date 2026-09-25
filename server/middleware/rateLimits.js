const { rateLimit } = require("express-rate-limit");

const createLimiter = (windowMs, limit, message) => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message, code: "RATE_LIMITED" }
});

const authLimiter = createLimiter(15 * 60 * 1000, 15, "Too many authentication attempts. Try again later.");
const contactLimiter = createLimiter(60 * 60 * 1000, 5, "Too many contact requests. Try again later.");
const paymentLimiter = createLimiter(10 * 60 * 1000, 20, "Too many payment requests. Try again later.");

module.exports = { authLimiter, contactLimiter, paymentLimiter };
