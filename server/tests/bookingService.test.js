const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateBooking } = require("../services/bookingService");

const packageItem = { _id: "507f1f77bcf86cd799439012", label: "Weekend", price: 5000, durationDays: 2 };
const car = {
  pricing: {
    perHour: 100,
    perDay: 1200,
    perWeek: 7000,
    packages: { id: (id) => id === String(packageItem._id) ? packageItem : null }
  }
};

test("daily price is calculated only from server car pricing", () => {
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 60 * 1000);
  const result = calculateBooking(car, { bookingType: "daily", startDate: start.toISOString(), endDate: end.toISOString() });
  assert.equal(result.totalAmountPaise, 240000);
});

test("package amount and duration come from stored package", () => {
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const result = calculateBooking(car, { bookingType: "package", startDate: start.toISOString(), packageId: String(packageItem._id) });
  assert.equal(result.totalAmountPaise, 500000);
  assert.equal(result.end.getTime() - result.start.getTime(), 2 * 24 * 60 * 60 * 1000);
});
