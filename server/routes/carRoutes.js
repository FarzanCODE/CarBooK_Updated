const express = require("express");
const { addCar, getAllCars, getAdminCars, getCarById, updateCar, deleteCarImage, deleteCar, addReview } = require("../controllers/carController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload, persistArray } = require("../config/cloudinary");
const { requireIntegration } = require("../middleware/securityMiddleware");
const { validate, validateObjectId } = require("../middleware/validate");
const { reviewSchema, carCreateSchema, carUpdateSchema, imageDeleteSchema } = require("../validation/schemas");

const router = express.Router();
router.get("/", getAllCars);
router.get("/admin/all", protect, adminOnly, getAdminCars);
router.get("/:id", validateObjectId(), getCarById);
router.post("/", protect, adminOnly, requireIntegration("cloudinary"), upload.array("images", 8), validate(carCreateSchema), persistArray("carbook/cars"), addCar);
router.put("/:id", protect, adminOnly, validateObjectId(), requireIntegration("cloudinary"), upload.array("images", 8), validate(carUpdateSchema), persistArray("carbook/cars"), updateCar);
router.delete("/:id/image", protect, adminOnly, validateObjectId(), requireIntegration("cloudinary"), validate(imageDeleteSchema), deleteCarImage);
router.delete("/:id", protect, adminOnly, validateObjectId(), deleteCar);
router.post("/:id/review", protect, validateObjectId(), validate(reviewSchema), addReview);

module.exports = router;
