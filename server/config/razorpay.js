const Razorpay = require("razorpay");
const env = require("./env");

let instance = null;

const getRazorpay = () => {
  if (!env.razorpayConfigured) throw new Error("Razorpay is not configured");
  if (!instance) instance = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  return instance;
};

module.exports = getRazorpay;
