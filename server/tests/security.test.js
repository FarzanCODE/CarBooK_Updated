const test = require("node:test");
const assert = require("node:assert/strict");
const { safeEqual, escapeRegex } = require("../utils/security");
const { toPaise, toRupees } = require("../utils/money");
const { bookingSchema, registerSchema } = require("../validation/schemas");

test("money conversion uses integer paise", () => {
  assert.equal(toPaise(123.45), 12345);
  assert.equal(toRupees(12345), 123.45);
});

test("safeEqual compares signatures without length exceptions", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abd"), false);
  assert.equal(safeEqual("abc", "abcd"), false);
});

test("escapeRegex neutralizes regex syntax", () => {
  assert.equal(escapeRegex("a.*(b)"), "a\\.\\*\\(b\\)");
});

test("booking validation rejects client supplied package price", () => {
  const result = bookingSchema.safeParse({
    carId: "507f1f77bcf86cd799439011",
    bookingType: "package",
    startDate: "2027-01-01T10:00:00.000Z",
    pickupLocation: "Airport",
    packageId: "507f1f77bcf86cd799439012",
    selectedPackage: { price: 1 }
  });
  assert.equal(result.success, false);
});

test("registration requires an eight character password", () => {
  assert.equal(registerSchema.safeParse({ name: "User", email: "user@example.com", password: "1234567" }).success, false);
  assert.equal(registerSchema.safeParse({ name: "User", email: "user@example.com", password: "12345678" }).success, true);
});
