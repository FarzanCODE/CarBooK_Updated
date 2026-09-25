const express = require("express");
const { createBooking, verifyPayment, getMyBookings, getBookingById, cancelBooking, getAllBookings, completeBooking, getAdminStats } = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { paymentLimiter } = require("../middleware/rateLimits");
const { requireIntegration } = require("../middleware/securityMiddleware");
const { validate, validateObjectId } = require("../middleware/validate");
const { bookingSchema, verifyPaymentSchema, cancellationSchema } = require("../validation/schemas");

const router = express.Router();
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/admin/all", protect, adminOnly, getAllBookings);
router.put("/:id/complete", protect, adminOnly, validateObjectId(), completeBooking);
router.post("/", protect, paymentLimiter, requireIntegration("razorpay"), validate(bookingSchema), createBooking);
router.post("/verify-payment", protect, paymentLimiter, requireIntegration("razorpay"), validate(verifyPaymentSchema), verifyPayment);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", protect, validateObjectId(), getBookingById);
router.put("/:id/cancel", protect, validateObjectId(), validate(cancellationSchema), cancelBooking);

module.exports = router;
