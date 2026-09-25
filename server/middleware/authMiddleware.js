const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const COOKIE_NAME = "carbook_session";

const generateToken = (userId, sessionVersion = 0) => jwt.sign({ sub: String(userId), ver: sessionVersion }, env.JWT_SECRET, {
  expiresIn: "7d",
  issuer: "carbook-api",
  audience: "carbook-web"
});

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});

const setSessionCookie = (res, token) => res.cookie(COOKIE_NAME, token, cookieOptions());
const clearSessionCookie = (res) => res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: env.isProduction, sameSite: env.isProduction ? "none" : "lax", path: "/" });

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, { issuer: "carbook-api", audience: "carbook-web" });
  } catch {
    throw new AppError(401, "Session expired. Please sign in again.", "SESSION_EXPIRED");
  }
  const user = await User.findById(decoded.sub).select("+sessionVersion");
  if (!user) throw new AppError(401, "Account no longer exists", "ACCOUNT_NOT_FOUND");
  if (decoded.ver !== user.sessionVersion) throw new AppError(401, "Session expired. Please sign in again.", "SESSION_REVOKED");
  req.user = user;
  next();
});

const adminOnly = (req, res, next) => req.user?.role === "admin" ? next() : next(new AppError(403, "Administrator access required", "FORBIDDEN"));

module.exports = { generateToken, setSessionCookie, clearSessionCookie, protect, adminOnly };
