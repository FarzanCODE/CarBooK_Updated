const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken, setSessionCookie, clearSessionCookie } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar, emailVerifiedAt: user.emailVerifiedAt });

const registerUser = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError(409, "Email is already registered", "EMAIL_IN_USE");
  const password = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({ name: req.body.name, email: req.body.email, phone: req.body.phone, password });
  setSessionCookie(res, generateToken(user._id, user.sessionVersion));
  res.status(201).json({ success: true, user: publicUser(user) });
});

const loginUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password +sessionVersion");
  if (!user || !user.password || !(await bcrypt.compare(req.body.password, user.password))) throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  setSessionCookie(res, generateToken(user._id, user.sessionVersion));
  res.json({ success: true, user: publicUser(user) });
});

const logoutUser = (req, res) => {
  clearSessionCookie(res);
  res.json({ success: true, message: "Signed out" });
};

const getMe = (req, res) => res.json({ success: true, user: publicUser(req.user) });

const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;
  req.user.phone = req.body.phone;
  await req.user.save();
  res.json({ success: true, user: publicUser(req.user) });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password +sessionVersion");
  if (!user.password) throw new AppError(400, "This account uses Google sign-in", "PASSWORD_NOT_SET");
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) throw new AppError(400, "Current password is incorrect", "INVALID_PASSWORD");
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  user.sessionVersion += 1;
  await user.save();
  setSessionCookie(res, generateToken(user._id, user.sessionVersion));
  res.json({ success: true, message: "Password changed" });
});

module.exports = { registerUser, loginUser, logoutUser, getMe, updateProfile, changePassword };
