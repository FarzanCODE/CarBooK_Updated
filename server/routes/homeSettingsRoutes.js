const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload, persistSingle } = require("../config/cloudinary");
const { requireIntegration } = require("../middleware/securityMiddleware");
const { validate, validateObjectId } = require("../middleware/validate");
const { getHomeSettings, updateFounderProfile, addTestimonial, deleteTestimonial } = require("../controllers/homeSettingsController");
const { founderSchema, testimonialSchema } = require("../validation/schemas");

const router = express.Router();
router.get("/", getHomeSettings);
router.put("/founder", protect, adminOnly, requireIntegration("cloudinary"), upload.single("image"), validate(founderSchema), persistSingle("carbook/profiles"), updateFounderProfile);
router.post("/testimonial", protect, adminOnly, validate(testimonialSchema), addTestimonial);
router.delete("/testimonial/:testimonialId", protect, adminOnly, validateObjectId("testimonialId"), deleteTestimonial);
module.exports = router;
