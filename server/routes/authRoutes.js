const crypto = require("crypto");
const express = require("express");
const passport = require("../config/passport");
const env = require("../config/env");
const { registerUser, loginUser, logoutUser, getMe, updateProfile, changePassword } = require("../controllers/authController");
const { protect, generateToken, setSessionCookie } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimits");
const { requireIntegration } = require("../middleware/securityMiddleware");
const { validate } = require("../middleware/validate");
const { safeEqual } = require("../utils/security");
const AppError = require("../utils/appError");
const { registerSchema, loginSchema, profileSchema, passwordSchema } = require("../validation/schemas");

const router = express.Router();
const OAUTH_STATE_COOKIE = "carbook_oauth_state";
const oauthCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/api/auth/google"
};

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(profileSchema), updateProfile);
router.put("/password", protect, authLimiter, validate(passwordSchema), changePassword);
router.get("/google", requireIntegration("google"), (req, res, next) => {
  const state = crypto.randomBytes(32).toString("hex");
  res.cookie(OAUTH_STATE_COOKIE, state, oauthCookieOptions);
  passport.authenticate("google", { scope: ["profile", "email"], session: false, state })(req, res, next);
});
router.get("/google/callback", requireIntegration("google"), (req, res, next) => {
  const expected = req.cookies[OAUTH_STATE_COOKIE];
  const received = req.query.state;
  res.clearCookie(OAUTH_STATE_COOKIE, { httpOnly: true, secure: env.isProduction, sameSite: "lax", path: "/api/auth/google" });
  if (!expected || !received || !safeEqual(expected, received)) return next(new AppError(400, "Invalid Google sign-in state", "INVALID_OAUTH_STATE"));
  return passport.authenticate("google", { failureRedirect: `${env.primaryFrontendUrl}/login?error=google_failed`, session: false })(req, res, next);
}, (req, res) => {
  setSessionCookie(res, generateToken(req.user._id, req.user.sessionVersion));
  res.redirect(`${env.primaryFrontendUrl}/auth/google/success`);
});

module.exports = router;
