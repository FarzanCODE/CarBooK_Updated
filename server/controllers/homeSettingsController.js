const HomeSettings = require("../models/HomeSettings");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const settingsDocument = async () =>
  HomeSettings.findOne() || HomeSettings.create({});

const getHomeSettings = asyncHandler(async (req, res) => {
  const settings = await settingsDocument();
  res.json({ success: true, settings });
});

const updateFounderProfile = asyncHandler(async (req, res) => {
  const settings = await settingsDocument();
  if (req.body.name)
    settings.founder.name = String(req.body.name).trim().slice(0, 80);
  if (req.body.role)
    settings.founder.role = String(req.body.role).trim().slice(0, 120);
  if (req.body.bio)
    settings.founder.bio = String(req.body.bio).trim().slice(0, 1000);
  if (req.file) settings.founder.image = req.file.path;
  await settings.save();
  res.json({ success: true, settings });
});

const addTestimonial = asyncHandler(async (req, res) => {
  const settings = await settingsDocument();
  settings.testimonials.push({
    name: String(req.body.name || "")
      .trim()
      .slice(0, 80),
    city: String(req.body.city || "")
      .trim()
      .slice(0, 80),
    text: String(req.body.text || "")
      .trim()
      .slice(0, 500),
    rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
  });
  await settings.save();
  res.status(201).json({ success: true, settings });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const settings = await settingsDocument();
  const testimonial = settings.testimonials.id(req.params.testimonialId);
  if (!testimonial)
    throw new AppError(404, "Testimonial not found", "TESTIMONIAL_NOT_FOUND");
  testimonial.deleteOne();
  await settings.save();
  res.json({ success: true, settings });
});

module.exports = {
  getHomeSettings,
  updateFounderProfile,
  addTestimonial,
  deleteTestimonial,
};
