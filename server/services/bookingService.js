const crypto = require("crypto");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const AppError = require("../utils/appError");
const { toPaise } = require("../utils/money");

const HOLD_MINUTES = 12;
const LOCK_MS = 120000;

const acquireCarLock = async (carId) => {
  const now = new Date();
  const lockUntil = new Date(Date.now() + LOCK_MS);
  const lockToken = crypto.randomUUID();
  const car = await Car.findOneAndUpdate({
    _id: carId,
    $or: [{ bookingLockUntil: null }, { bookingLockUntil: { $lte: now } }]
  }, { $set: { bookingLockUntil: lockUntil, bookingLockToken: lockToken } }, { new: true, select: "+bookingLockUntil +bookingLockToken" });
  if (!car) throw new AppError(409, "This car is being booked right now. Please retry.", "BOOKING_BUSY");
  return { car, lockToken };
};

const releaseCarLock = async (carId, lockToken) => {
  await Car.updateOne({ _id: carId, bookingLockToken: lockToken }, { $set: { bookingLockUntil: null, bookingLockToken: null } });
};

const findConflict = (carId, startDate, endDate, excludeBookingId) => {
  const query = {
    car: carId,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
    $or: [{ status: "confirmed" }, { status: "pending", holdExpiresAt: { $gt: new Date() } }]
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  return Booking.findOne(query).select("_id status startDate endDate");
};

const calculateBooking = (car, input) => {
  const start = new Date(input.startDate);
  if (!Number.isFinite(start.getTime()) || start <= new Date()) throw new AppError(400, "Start time must be in the future", "INVALID_DATES");
  let end;
  let totalAmountPaise;
  let totalHours = 0;
  let selectedPackage;
  if (input.bookingType === "package") {
    const pkg = car.pricing.packages.id(input.packageId);
    if (!pkg) throw new AppError(400, "Selected package does not exist", "INVALID_PACKAGE");
    end = new Date(start.getTime() + pkg.durationDays * 86400000);
    totalAmountPaise = toPaise(pkg.price);
    selectedPackage = { packageId: pkg._id, label: pkg.label, pricePaise: totalAmountPaise, durationDays: pkg.durationDays };
  } else {
    end = new Date(input.endDate);
    if (!Number.isFinite(end.getTime()) || end <= start) throw new AppError(400, "End time must be after start time", "INVALID_DATES");
    const diffHours = (end - start) / 3600000;
    if (input.bookingType === "hourly") {
      totalHours = Math.ceil(diffHours);
      totalAmountPaise = toPaise(totalHours * car.pricing.perHour);
    }
    if (input.bookingType === "daily") totalAmountPaise = toPaise(Math.ceil(diffHours / 24) * car.pricing.perDay);
    if (input.bookingType === "weekly") totalAmountPaise = toPaise(Math.ceil(diffHours / 168) * car.pricing.perWeek);
  }
  if (!totalAmountPaise || totalAmountPaise < 100) throw new AppError(400, "Pricing is not configured for this booking type", "PRICING_UNAVAILABLE");
  return { start, end, totalAmountPaise, totalHours, selectedPackage };
};

const createHoldExpiry = () => new Date(Date.now() + HOLD_MINUTES * 60000);

module.exports = { acquireCarLock, releaseCarLock, findConflict, calculateBooking, createHoldExpiry, HOLD_MINUTES };
