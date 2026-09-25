const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const phone = z.string().trim().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian phone number").or(z.literal(""));
const dateString = z.string().datetime({ offset: true });
const optionalNumber = (schema) => z.preprocess((value) => value === "" || value === undefined ? undefined : value, schema.optional());
const packageSchema = z.object({
  label: z.string().trim().min(2).max(80),
  price: z.coerce.number().positive().max(10000000),
  durationDays: z.coerce.number().int().min(1).max(90)
}).strip();
const packagesSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}, z.array(packageSchema).max(12));

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(8).max(128),
  phone: phone.optional().default("")
}).strict();

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(128) }).strict();
const profileSchema = z.object({ name: z.string().trim().min(2).max(80), phone: phone.optional().default("") }).strict();
const passwordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(8).max(128) }).strict();

const bookingSchema = z.object({
  carId: objectId,
  bookingType: z.enum(["hourly", "daily", "weekly", "package"]),
  startDate: dateString,
  endDate: dateString.optional(),
  pickupLocation: z.string().trim().min(2).max(160),
  dropLocation: z.string().trim().max(160).optional().default(""),
  packageId: objectId.optional()
}).strict().superRefine((value, ctx) => {
  if (value.bookingType === "package" && !value.packageId) ctx.addIssue({ code: "custom", path: ["packageId"], message: "Package is required" });
  if (value.bookingType !== "package" && !value.endDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date is required" });
});

const verifyPaymentSchema = z.object({
  bookingId: objectId,
  razorpayOrderId: z.string().trim().min(5).max(100),
  razorpayPaymentId: z.string().trim().min(5).max(100),
  razorpaySignature: z.string().regex(/^[a-f\d]{64}$/i, "Invalid payment signature")
}).strict();

const cancellationSchema = z.object({ cancellationReason: z.string().trim().max(500).optional().default("Cancelled by user") }).strict();
const reviewSchema = z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(1000).optional().default("") }).strict();
const contactSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(160), message: z.string().trim().min(10).max(2000) }).strict();

const carBase = {
  name: z.string().trim().min(2).max(80),
  brand: z.string().trim().min(2).max(80),
  category: z.enum(["Sedan", "SUV", "Luxury", "Electric", "Bike/Scooter", "Mini/Hatchback", "General"]),
  description: z.string().trim().max(2500).optional().default(""),
  location: z.string().trim().min(2).max(120),
  operationalStatus: z.enum(["active", "maintenance", "inactive"]).optional().default("active"),
  perHour: optionalNumber(z.coerce.number().min(0).max(10000000)).default(0),
  perDay: optionalNumber(z.coerce.number().min(0).max(10000000)).default(0),
  perWeek: optionalNumber(z.coerce.number().min(0).max(10000000)).default(0),
  seats: optionalNumber(z.coerce.number().int().min(1).max(60)).default(5),
  fuelType: z.enum(["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]).optional().default("Petrol"),
  transmission: z.enum(["Manual", "Automatic", "Semi-Automatic", "CVT", "DCT", "AMT"]).optional().default("Manual"),
  mileage: z.string().trim().max(40).optional().default(""),
  year: optionalNumber(z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1)),
  packages: packagesSchema.optional().default([])
};

const carCreateSchema = z.object(carBase).strip().superRefine((value, ctx) => {
  if (value.operationalStatus === "active" && value.perHour <= 0 && value.perDay <= 0 && value.perWeek <= 0 && value.packages.length === 0) ctx.addIssue({ code: "custom", message: "An active vehicle needs at least one booking price" });
});
const carUpdateSchema = z.object(Object.fromEntries(Object.entries(carBase).map(([key, schema]) => [key, schema.optional()]))).strip();
const imageDeleteSchema = z.object({ imageUrl: z.string().url().max(1000) }).strict();
const founderSchema = z.object({ name: z.string().trim().min(2).max(80).optional(), role: z.string().trim().min(2).max(120).optional(), bio: z.string().trim().min(2).max(1000).optional() }).strip();
const testimonialSchema = z.object({ name: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(80), text: z.string().trim().min(5).max(500), rating: z.coerce.number().int().min(1).max(5) }).strict();

module.exports = { registerSchema, loginSchema, profileSchema, passwordSchema, bookingSchema, verifyPaymentSchema, cancellationSchema, reviewSchema, contactSchema, carCreateSchema, carUpdateSchema, imageDeleteSchema, founderSchema, testimonialSchema };
