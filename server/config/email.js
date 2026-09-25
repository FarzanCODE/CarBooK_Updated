const nodemailer = require("nodemailer");
const env = require("./env");
const escapeHtml = require("../utils/escapeHtml");

let transporter;
const getTransporter = () => {
  if (!env.emailConfigured) throw new Error("Email is not configured");
  if (!transporter) transporter = nodemailer.createTransport({ service: "gmail", auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS } });
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => getTransporter().sendMail({ from: `"CarBook" <${env.EMAIL_USER}>`, to, subject, html });
const shell = (title, body) => `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#ffffff;color:#151827"><div style="padding:20px 24px;background:#111425;border-radius:16px 16px 0 0"><strong style="font-size:24px;color:#8b5cf6">CarBook</strong></div><div style="padding:28px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px"><h2>${escapeHtml(title)}</h2>${body}</div></div>`;
const bookingRows = (booking, car) => `<p><strong>Vehicle:</strong> ${escapeHtml(`${car.brand} ${car.name}`)}</p><p><strong>Booking:</strong> ${escapeHtml(String(booking._id))}</p><p><strong>Start:</strong> ${escapeHtml(new Date(booking.startDate).toLocaleString("en-IN"))}</p><p><strong>End:</strong> ${escapeHtml(new Date(booking.endDate).toLocaleString("en-IN"))}</p><p><strong>Amount:</strong> ₹${escapeHtml(String(booking.totalAmount))}</p>`;
const bookingConfirmedEmail = (user, booking, car) => shell("Booking confirmed", `<p>Hi ${escapeHtml(user.name)},</p>${bookingRows(booking, car)}<p>Your payment has been verified and the reservation is confirmed.</p>`);
const bookingCancelledEmail = (user, booking, car) => shell("Booking cancelled", `<p>Hi ${escapeHtml(user.name)},</p>${bookingRows(booking, car)}<p><strong>Reason:</strong> ${escapeHtml(booking.cancellationReason || "Cancelled")}</p><p>Any applicable Razorpay refund will follow its recorded refund status.</p>`);
const bookingCompletedEmail = (user, booking, car) => shell("Trip completed", `<p>Hi ${escapeHtml(user.name)},</p>${bookingRows(booking, car)}<p>Thanks for using CarBook. You can now review this completed trip.</p>`);
const contactAdminEmail = (name, email, message) => shell("New contact request", `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`);
const contactThankYouEmail = (name) => shell("Message received", `<p>Hi ${escapeHtml(name)},</p><p>We received your message and will respond as soon as possible.</p>`);

module.exports = { sendEmail, bookingConfirmedEmail, bookingCancelledEmail, bookingCompletedEmail, contactAdminEmail, contactThankYouEmail };
