const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const env = require("./env");
const asyncHandler = require("../utils/asyncHandler");

if (env.cloudinaryConfigured) {
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8, fields: 30, fieldSize: 100 * 1024 },
  fileFilter(req, file, callback) {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    return callback(null, true);
  }
});

const uploadBuffer = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image", transformation: [{ width: 1600, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }] }, (error, result) => error ? reject(error) : resolve(result));
  stream.end(buffer);
});

const persistArray = (folder) => asyncHandler(async (req, res, next) => {
  req.files = await Promise.all((req.files || []).map(async (file) => {
    const result = await uploadBuffer(file.buffer, folder);
    return { ...file, path: result.secure_url, publicId: result.public_id };
  }));
  next();
});

const persistSingle = (folder) => asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const result = await uploadBuffer(req.file.buffer, folder);
  req.file = { ...req.file, path: result.secure_url, publicId: result.public_id };
  next();
});

module.exports = { cloudinary, upload, persistArray, persistSingle };
