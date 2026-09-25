const {
  sendEmail,
  contactAdminEmail,
  contactThankYouEmail,
} = require("../config/email");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");

const sendContactEmail = asyncHandler(async (req, res) => {
  await sendEmail({
    to: env.adminEmail,
    subject: "New CarBook inquiry",
    html: contactAdminEmail(req.body.name, req.body.email, req.body.message),
  });
  await sendEmail({
    to: req.body.email,
    subject: "We received your CarBook message",
    html: contactThankYouEmail(req.body.name),
  });
  res.json({ success: true, message: "Message sent" });
});

module.exports = { sendContactEmail };
