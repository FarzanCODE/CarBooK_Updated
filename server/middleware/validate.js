const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(". ");
    return next(new AppError(400, message, "VALIDATION_ERROR"));
  }
  req[source] = result.data;
  return next();
};

const validateObjectId = (param = "id") => (req, res, next) => mongoose.isValidObjectId(req.params[param]) ? next() : next(new AppError(400, "Invalid identifier", "INVALID_ID"));

module.exports = { validate, validateObjectId };
