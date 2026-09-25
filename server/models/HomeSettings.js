const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  rating: { type: Number, required: true, min: 1, max: 5 }
});

const homeSettingsSchema = new mongoose.Schema({
  founder: {
    name: { type: String, trim: true, maxlength: 80, default: "Md Farzan Farooquee" },
    role: { type: String, trim: true, maxlength: 120, default: "Developer, CarBook" },
    bio: { type: String, trim: true, maxlength: 1000, default: "CarBook is a portfolio car-rental platform built to demonstrate secure full-stack product engineering." },
    image: { type: String, default: "" }
  },
  testimonials: { type: [testimonialSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("HomeSettings", homeSettingsSchema);
