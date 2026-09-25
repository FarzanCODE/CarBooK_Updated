const crypto = require("crypto");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Car = require("../models/Car");
const getRazorpay = require("../config/razorpay");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { safeEqual } = require("../utils/security");
const { acquireCarLock, releaseCarLock, findConflict, calculateBooking, createHoldExpiry } = require("../services/bookingService");
const { sendEmail, bookingConfirmedEmail, bookingCancelledEmail, bookingCompletedEmail } = require("../config/email");

const createBooking = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();
  const { car, lockToken } = await acquireCarLock(req.body.carId);
  let booking;
  try {
    if (car.operationalStatus !== "active") throw new AppError(409, "This vehicle is currently unavailable", "CAR_UNAVAILABLE");
    const calculated = calculateBooking(car, req.body);
    const conflict = await findConflict(car._id, calculated.start, calculated.end);
    if (conflict) throw new AppError(409, "The vehicle is already reserved for part of this period", "BOOKING_CONFLICT");
    booking = await Booking.create({
      user: req.user._id,
      car: car._id,
      bookingType: req.body.bookingType,
      selectedPackage: calculated.selectedPackage,
      startDate: calculated.start,
      endDate: calculated.end,
      totalHours: calculated.totalHours,
      totalAmountPaise: calculated.totalAmountPaise,
      pickupLocation: req.body.pickupLocation,
      dropLocation: req.body.dropLocation,
      holdExpiresAt: createHoldExpiry(),
      payment: { method: "razorpay", status: "pending" }
    });
  } finally {
    await releaseCarLock(req.body.carId, lockToken);
  }

  try {
    const order = await razorpay.orders.create({
      amount: booking.totalAmountPaise,
      currency: "INR",
      receipt: `cb_${Date.now()}_${String(req.user._id).slice(-6)}`,
      notes: { bookingId: String(booking._id), carId: String(booking.car), userId: String(req.user._id) }
    });
    booking.payment.razorpayOrderId = order.id;
    await booking.save();
    res.status(201).json({ success: true, booking, razorpayOrder: { id: order.id, amount: order.amount, currency: order.currency, key: env.RAZORPAY_KEY_ID } });
  } catch (error) {
    booking.status = "payment_failed";
    booking.holdExpiresAt = null;
    booking.payment.status = "failed";
    await booking.save();
    throw error;
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();
  let booking = await Booking.findById(req.body.bookingId).select("+payment.razorpaySignature");
  if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
  if (String(booking.user) !== String(req.user._id)) throw new AppError(403, "You do not own this booking", "FORBIDDEN");
  if (booking.payment.razorpayOrderId !== req.body.razorpayOrderId) throw new AppError(400, "Payment order does not match this booking", "ORDER_MISMATCH");

  const signedBody = `${booking.payment.razorpayOrderId}|${req.body.razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(signedBody).digest("hex");
  if (!safeEqual(expected, req.body.razorpaySignature)) throw new AppError(400, "Payment signature verification failed", "INVALID_SIGNATURE");

  const carId = booking.car;
  const { car, lockToken } = await acquireCarLock(carId);
  try {
    booking = await Booking.findById(booking._id).select("+payment.razorpaySignature");
    if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
    if (booking.status === "confirmed" && booking.payment.razorpayPaymentId === req.body.razorpayPaymentId) {
      return res.json({ success: true, message: "Payment already verified", booking });
    }

    let payment = await razorpay.payments.fetch(req.body.razorpayPaymentId);
    if (payment.order_id !== booking.payment.razorpayOrderId || Number(payment.amount) !== booking.totalAmountPaise || payment.currency !== "INR") throw new AppError(400, "Payment details do not match the booking", "PAYMENT_MISMATCH");
    if (payment.status === "authorized") payment = await razorpay.payments.capture(payment.id, booking.totalAmountPaise, "INR");
    if (payment.status !== "captured") throw new AppError(409, "Payment has not been captured", "PAYMENT_NOT_CAPTURED");

    if (["confirmed", "completed"].includes(booking.status)) {
      await razorpay.payments.refund(payment.id, { amount: booking.totalAmountPaise, notes: { bookingId: String(booking._id), reason: "duplicate_payment" } });
      throw new AppError(409, "This booking was already finalized. The duplicate captured payment is being refunded.", "DUPLICATE_PAYMENT_REFUND_INITIATED");
    }

    if (booking.status === "cancelled") {
      if (booking.payment.razorpayPaymentId === payment.id && ["refund_pending", "refunded"].includes(booking.payment.status)) throw new AppError(409, "This payment is already being refunded.", "REFUND_ALREADY_STARTED");
      const refund = await razorpay.payments.refund(payment.id, { amount: booking.totalAmountPaise, notes: { bookingId: String(booking._id), reason: "booking_cancelled" } });
      booking.payment.razorpayPaymentId = payment.id;
      booking.payment.razorpaySignature = req.body.razorpaySignature;
      booking.payment.refundId = refund.id;
      booking.payment.status = refund.status === "processed" ? "refunded" : "refund_pending";
      booking.payment.paidAt = booking.payment.paidAt || new Date();
      if (refund.status === "processed") booking.payment.refundedAt = new Date();
      await booking.save();
      throw new AppError(409, "This booking was cancelled. The captured payment is being refunded.", "PAYMENT_REFUND_INITIATED");
    }

    if (booking.status !== "pending") {
      await razorpay.payments.refund(payment.id, { amount: booking.totalAmountPaise, notes: { bookingId: String(booking._id), reason: `state_${booking.status}` } });
      throw new AppError(409, "This booking can no longer be confirmed. The captured payment is being refunded.", "PAYMENT_REFUND_INITIATED");
    }

    const conflict = await findConflict(booking.car, booking.startDate, booking.endDate, booking._id);
    const expired = booking.holdExpiresAt && booking.holdExpiresAt <= new Date();
    const unavailable = car.operationalStatus !== "active";

    if (conflict || expired || unavailable) {
      const reason = expired ? "hold_expired" : unavailable ? "car_unavailable" : "booking_conflict";
      const refund = await razorpay.payments.refund(payment.id, { amount: booking.totalAmountPaise, notes: { bookingId: String(booking._id), reason } });
      booking.status = "cancelled";
      booking.holdExpiresAt = null;
      booking.cancelledAt = new Date();
      booking.cancellationReason = expired ? "Payment completed after reservation hold expired" : unavailable ? "Vehicle became unavailable before payment confirmation" : "Reservation conflict detected during payment confirmation";
      booking.payment.razorpayPaymentId = payment.id;
      booking.payment.razorpaySignature = req.body.razorpaySignature;
      booking.payment.refundId = refund.id;
      booking.payment.status = refund.status === "processed" ? "refunded" : "refund_pending";
      booking.payment.paidAt = new Date();
      if (refund.status === "processed") booking.payment.refundedAt = new Date();
      await booking.save();
      throw new AppError(409, "The booking can no longer be confirmed. The captured payment is being refunded.", "PAYMENT_REFUND_INITIATED");
    }

    booking.status = "confirmed";
    booking.holdExpiresAt = null;
    booking.payment.status = "paid";
    booking.payment.razorpayPaymentId = payment.id;
    booking.payment.razorpaySignature = req.body.razorpaySignature;
    booking.payment.paidAt = new Date();
    await booking.save();
  } finally {
    await releaseCarLock(carId, lockToken);
  }

  const populated = await Booking.findById(booking._id).populate("car");
  sendEmail({ to: req.user.email, subject: "Booking confirmed - CarBook", html: bookingConfirmedEmail(req.user, populated, populated.car) }).catch(() => {});
  res.json({ success: true, message: "Payment verified and booking confirmed", booking: populated });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("car", "name brand images pricing category location operationalStatus").sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("car", "name brand images pricing location operationalStatus").populate("user", "name email phone");
  if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
  if ((!booking.user || String(booking.user._id) !== String(req.user._id)) && req.user.role !== "admin") throw new AppError(403, "Not authorized to view this booking", "FORBIDDEN");
  res.json({ success: true, booking });
});

const cancelBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
  if (String(booking.user) !== String(req.user._id)) throw new AppError(403, "Not authorized to cancel this booking", "FORBIDDEN");

  const carId = booking.car;
  const { lockToken } = await acquireCarLock(carId);
  try {
    booking = await Booking.findById(booking._id);
    if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
    if (["cancelled", "completed"].includes(booking.status)) throw new AppError(409, `Booking is already ${booking.status}`, "INVALID_BOOKING_STATE");
    if (booking.startDate <= new Date() && booking.status === "confirmed") throw new AppError(409, "A started booking cannot be cancelled online", "CANCELLATION_CLOSED");

    if (booking.payment.status === "paid") {
      const razorpay = getRazorpay();
      const refund = await razorpay.payments.refund(booking.payment.razorpayPaymentId, { amount: booking.totalAmountPaise, notes: { bookingId: String(booking._id), reason: "user_cancelled" } });
      booking.payment.refundId = refund.id;
      booking.payment.status = refund.status === "processed" ? "refunded" : "refund_pending";
      if (refund.status === "processed") booking.payment.refundedAt = new Date();
    }

    booking.status = "cancelled";
    booking.holdExpiresAt = null;
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.cancellationReason;
    await booking.save();
  } finally {
    await releaseCarLock(carId, lockToken);
  }

  const populated = await Booking.findById(booking._id).populate("car");
  const user = await User.findById(booking.user);
  sendEmail({ to: user.email, subject: "Booking cancelled - CarBook", html: bookingCancelledEmail(user, populated, populated.car) }).catch(() => {});
  res.json({ success: true, message: booking.payment.status === "refund_pending" ? "Booking cancelled. Refund is processing." : "Booking cancelled", booking: populated });
});

const getAllBookings = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const allowedStatuses = new Set(["pending", "confirmed", "cancelled", "completed", "payment_failed"]);
  const query = allowedStatuses.has(req.query.status) ? { status: req.query.status } : {};
  const [bookings, total] = await Promise.all([
    Booking.find(query).populate("user", "name email phone").populate("car", "name brand category").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Booking.countDocuments(query)
  ]);
  res.json({ success: true, total, page, pages: Math.ceil(total / limit), bookings });
});

const completeBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
  const carId = booking.car;
  const { lockToken } = await acquireCarLock(carId);
  try {
    booking = await Booking.findById(booking._id);
    if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
    if (booking.status !== "confirmed") throw new AppError(409, "Only confirmed bookings can be completed", "INVALID_BOOKING_STATE");
    booking.status = "completed";
    await booking.save();
  } finally {
    await releaseCarLock(carId, lockToken);
  }
  const populated = await Booking.findById(booking._id).populate("car").populate("user");
  sendEmail({ to: populated.user.email, subject: "Trip completed - CarBook", html: bookingCompletedEmail(populated.user, populated, populated.car) }).catch(() => {});
  res.json({ success: true, message: "Booking completed", booking: populated });
});

const getAdminStats = asyncHandler(async (req, res) => {
  const [totalBookings, confirmedBookings, cancelledBookings, completedBookings, revenue, totalCars, activeCars] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "cancelled" }),
    Booking.countDocuments({ status: "completed" }),
    Booking.aggregate([{ $match: { "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmountPaise" } } }]),
    Car.countDocuments(),
    Car.countDocuments({ operationalStatus: "active" })
  ]);
  res.json({ success: true, stats: { totalBookings, confirmedBookings, cancelledBookings, completedBookings, totalRevenue: (revenue[0]?.total || 0) / 100, totalCars, activeCars } });
});

module.exports = { createBooking, verifyPayment, getMyBookings, getBookingById, cancelBooking, getAllBookings, completeBooking, getAdminStats };
