const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().trim().min(1),
  JWT_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().trim().min(1),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().trim().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().trim().min(1).optional(),
  RAZORPAY_KEY_ID: z.string().trim().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().trim().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().trim().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().trim().min(1).optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().trim().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n"),
  );
}

const env = parsed.data;
env.isProduction = env.NODE_ENV === "production";
env.allowedOrigins = env.FRONTEND_URL.split(",").map(
  (value) => new URL(value.trim()).origin,
);
env.primaryFrontendUrl = env.allowedOrigins[0];
env.googleConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);
env.razorpayConfigured = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET,
);
env.cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET,
);
env.emailConfigured = Boolean(env.EMAIL_USER && env.EMAIL_PASS);
env.adminEmail = env.ADMIN_EMAIL || env.EMAIL_USER;
env.googleCallbackUrl =
  env.GOOGLE_CALLBACK_URL || `${env.BACKEND_URL}/api/auth/google/callback`;

module.exports = env;
