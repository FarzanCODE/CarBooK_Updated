const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 80 },
  price: { type: Number, required: true, min: 1, max: 10000000 },
  durationDays: { type: Number, required: true, min: 1, max: 90 }
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000, default: "" }
}, { timestamps: true });

const carSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  brand: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  category: { type: String, required: true, enum: ["Sedan", "SUV", "Luxury", "Electric", "Bike/Scooter", "Mini/Hatchback", "General"] },
  description: { type: String, trim: true, maxlength: 2500, default: "" },
  pricing: {
    perHour: { type: Number, min: 0, max: 10000000, default: 0 },
    perDay: { type: Number, min: 0, max: 10000000, default: 0 },
    perWeek: { type: Number, min: 0, max: 10000000, default: 0 },
    packages: { type: [packageSchema], default: [] }
  },
  specs: {
    seats: { type: Number, min: 1, max: 60, default: 5 },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"], default: "Petrol" },
    transmission: { type: String, enum: ["Manual", "Automatic", "Semi-Automatic", "CVT", "DCT", "AMT"], default: "Manual" },
    mileage: { type: String, trim: true, maxlength: 40, default: "" },
    year: { type: Number, min: 1990, max: new Date().getFullYear() + 1 }
  },
  images: { type: [String], default: [] },
  location: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  operationalStatus: { type: String, enum: ["active", "maintenance", "inactive"], default: "active" },
  reviews: { type: [reviewSchema], default: [] },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  totalReviews: { type: Number, min: 0, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingLockUntil: { type: Date, default: null, select: false },
  bookingLockToken: { type: String, default: null, select: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

carSchema.virtual("isAvailable").get(function isAvailable() {
  return this.operationalStatus === "active";
});

carSchema.index({ category: 1, operationalStatus: 1 });
carSchema.index({ location: 1 });
carSchema.index({ brand: 1, name: 1 });
carSchema.index({ "pricing.perDay": 1 });

module.exports = mongoose.model("Car", carSchema);
