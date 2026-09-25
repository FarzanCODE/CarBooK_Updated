const express = require("express");
const { sendContactEmail } = require("../controllers/contactController");
const { contactLimiter } = require("../middleware/rateLimits");
const { requireIntegration } = require("../middleware/securityMiddleware");
const { validate } = require("../middleware/validate");
const { contactSchema } = require("../validation/schemas");

const router = express.Router();
router.post("/", contactLimiter, requireIntegration("email"), validate(contactSchema), sendContactEmail);
module.exports = router;
