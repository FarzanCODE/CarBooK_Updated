const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  bookingType: { type: String, enum: ["hourly", "daily", "weekly", "package"], required: true },
  selectedPackage: {
    packageId: { type: mongoose.Schema.Types.ObjectId },
    label: { type: String },
    pricePaise: { type: Number },
    durationDays: { type: Number }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalHours: { type: Number, min: 0, default: 0 },
  totalAmountPaise: { type: Number, required: true, min: 100 },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed", "payment_failed"], default: "pending" },
  holdExpiresAt: { type: Date, default: null },
  payment: {
    method: { type: String, enum: ["razorpay"], default: "razorpay" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String, select: false },
    refundId: { type: String },
    status: { type: String, enum: ["pending", "paid", "failed", "refund_pending", "refunded"], default: "pending" },
    paidAt: { type: Date },
    refundedAt: { type: Date }
  },
  pickupLocation: { type: String, required: true, trim: true, maxlength: 160 },
  dropLocation: { type: String, trim: true, maxlength: 160, default: "" },
  cancellationReason: { type: String, trim: true, maxlength: 500, default: "" },
  cancelledAt: { type: Date },
  isReviewed: { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

bookingSchema.virtual("totalAmount").get(function totalAmount() {
  return Number((this.totalAmountPaise / 100).toFixed(2));
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ "payment.razorpayOrderId": 1 }, { unique: true, sparse: true });
bookingSchema.index({ "payment.razorpayPaymentId": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Booking", bookingSchema);
