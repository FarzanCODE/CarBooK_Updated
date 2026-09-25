const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const env = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { verifyRequestOrigin } = require("./middleware/securityMiddleware");
const AppError = require("./utils/appError");

const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const homeSettingsRoutes = require("./routes/homeSettingsRoutes");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new AppError(403, "Origin not allowed", "ORIGIN_REJECTED"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false, limit: "200kb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(verifyRequestOrigin);

app.get("/api/health", (req, res) => res.json({ success: true, service: "carbook-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/home-settings", homeSettingsRoutes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => console.log(`CarBook API listening on ${env.PORT}`));
};

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = app;
