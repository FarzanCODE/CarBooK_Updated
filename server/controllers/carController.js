const Car = require("../models/Car");
const Booking = require("../models/Booking");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { escapeRegex } = require("../utils/security");

const parsePackages = (value, fallback = []) => {
  if (value === undefined) return fallback;
  const packages = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(packages))
    throw new AppError(400, "Packages must be an array", "VALIDATION_ERROR");
  return packages.map((pkg) => ({
    label: String(pkg.label || "").trim(),
    price: Number(pkg.price),
    durationDays: Number(pkg.durationDays),
  }));
};

const payloadFromRequest = (req, existing) => ({
  name: req.body.name ?? existing?.name,
  brand: req.body.brand ?? existing?.brand,
  category: req.body.category ?? existing?.category,
  description: req.body.description ?? existing?.description ?? "",
  location: req.body.location ?? existing?.location,
  operationalStatus:
    req.body.operationalStatus ??
    (req.body.isAvailable === undefined
      ? (existing?.operationalStatus ?? "active")
      : String(req.body.isAvailable) === "true" || req.body.isAvailable === true
        ? "active"
        : "inactive"),
  pricing: {
    perHour:
      req.body.perHour === undefined
        ? existing?.pricing?.perHour || 0
        : Number(req.body.perHour),
    perDay:
      req.body.perDay === undefined
        ? existing?.pricing?.perDay || 0
        : Number(req.body.perDay),
    perWeek:
      req.body.perWeek === undefined
        ? existing?.pricing?.perWeek || 0
        : Number(req.body.perWeek),
    packages: parsePackages(
      req.body.packages,
      existing?.pricing?.packages || [],
    ),
  },
  specs: {
    seats:
      req.body.seats === undefined
        ? existing?.specs?.seats || 5
        : Number(req.body.seats),
    fuelType: req.body.fuelType ?? existing?.specs?.fuelType ?? "Petrol",
    transmission:
      req.body.transmission ?? existing?.specs?.transmission ?? "Manual",
    mileage: req.body.mileage ?? existing?.specs?.mileage ?? "",
    year:
      req.body.year === undefined || req.body.year === ""
        ? existing?.specs?.year
        : Number(req.body.year),
  },
});

const addCar = asyncHandler(async (req, res) => {
  const payload = payloadFromRequest(req);
  payload.images = (req.files || []).map((file) => file.path);
  payload.addedBy = req.user._id;
  const car = await Car.create(payload);
  res.status(201).json({ success: true, car });
});

const buildCarQuery = (req, includeInactive = false) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.fuelType) query["specs.fuelType"] = req.query.fuelType;
  if (req.query.transmission)
    query["specs.transmission"] = req.query.transmission;
  if (req.query.location)
    query.location = {
      $regex: escapeRegex(String(req.query.location).slice(0, 80)),
      $options: "i",
    };
  if (req.query.search) {
    const term = escapeRegex(String(req.query.search).slice(0, 80));
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { brand: { $regex: term, $options: "i" } },
    ];
  }
  if (req.query.minPrice || req.query.maxPrice) {
    query["pricing.perDay"] = {};
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (req.query.minPrice && Number.isFinite(minPrice))
      query["pricing.perDay"].$gte = Math.max(0, minPrice);
    if (req.query.maxPrice && Number.isFinite(maxPrice))
      query["pricing.perDay"].$lte = Math.max(0, maxPrice);
  }
  if (includeInactive && req.query.status)
    query.operationalStatus = req.query.status;
  if (!includeInactive) {
    const activeQuery = {
      $or: [
        { operationalStatus: "active" },
        { operationalStatus: { $exists: false }, isAvailable: true },
      ],
    };
    if (query.$or) {
      query.$and = [activeQuery, { $or: query.$or }];
      delete query.$or;
    } else {
      Object.assign(query, activeQuery);
    }
  }
  return query;
};

const listCars = async (req, res, includeInactive = false) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const query = buildCarQuery(req, includeInactive);
  const sortMap = {
    price_asc: { "pricing.perDay": 1 },
    price_desc: { "pricing.perDay": -1 },
    rating: { averageRating: -1 },
    newest: { createdAt: -1 },
  };
  const sort = sortMap[req.query.sortBy] || { createdAt: -1 };
  const [cars, total] = await Promise.all([
    Car.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Car.countDocuments(query),
  ]);
  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    cars,
  });
};

const getAllCars = asyncHandler(async (req, res) => listCars(req, res, false));
const getAdminCars = asyncHandler(async (req, res) => listCars(req, res, true));

const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id).populate(
    "reviews.user",
    "name avatar",
  );
  if (!car) throw new AppError(404, "Car not found", "CAR_NOT_FOUND");
  res.json({ success: true, car });
});

const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError(404, "Car not found", "CAR_NOT_FOUND");
  const payload = payloadFromRequest(req, car);
  Object.assign(car, payload);
  car.images = [
    ...car.images,
    ...(req.files || []).map((file) => file.path),
  ].slice(0, 12);
  await car.save();
  res.json({ success: true, car });
});

const publicIdFromCloudinaryUrl = (url) => {
  const match = String(url).match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

const deleteCarImage = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError(404, "Car not found", "CAR_NOT_FOUND");
  const imageUrl = String(req.body.imageUrl || "");
  if (!car.images.includes(imageUrl))
    throw new AppError(
      400,
      "Image does not belong to this car",
      "INVALID_IMAGE",
    );
  const publicId = publicIdFromCloudinaryUrl(imageUrl);
  if (publicId)
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  car.images = car.images.filter((image) => image !== imageUrl);
  await car.save();
  res.json({ success: true, message: "Image deleted", car });
});

const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError(404, "Car not found", "CAR_NOT_FOUND");
  const hasHistory = await Booking.exists({ car: car._id });
  if (hasHistory) {
    car.operationalStatus = "inactive";
    await car.save();
    return res.json({
      success: true,
      message: "Car archived because booking history exists",
      car,
    });
  }
  await Promise.all(
    car.images.map((url) => {
      const publicId = publicIdFromCloudinaryUrl(url);
      return publicId
        ? cloudinary.uploader.destroy(publicId, { resource_type: "image" })
        : Promise.resolve();
    }),
  );
  await car.deleteOne();
  res.json({ success: true, message: "Car deleted" });
});

const addReview = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError(404, "Car not found", "CAR_NOT_FOUND");
  const booking = await Booking.findOne({
    user: req.user._id,
    car: car._id,
    status: "completed",
    isReviewed: false,
  }).sort({ endDate: -1 });
  if (!booking)
    throw new AppError(
      403,
      "Complete a trip with this car before reviewing it",
      "REVIEW_NOT_ELIGIBLE",
    );
  if (
    car.reviews.some((review) => String(review.booking) === String(booking._id))
  )
    throw new AppError(
      409,
      "This trip has already been reviewed",
      "ALREADY_REVIEWED",
    );
  car.reviews.push({
    user: req.user._id,
    booking: booking._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  car.totalReviews = car.reviews.length;
  car.averageRating = Number(
    (
      car.reviews.reduce((sum, review) => sum + review.rating, 0) /
      car.totalReviews
    ).toFixed(2),
  );
  booking.isReviewed = true;
  await Promise.all([car.save(), booking.save()]);
  res.status(201).json({ success: true, message: "Review added", car });
});

module.exports = {
  addCar,
  getAllCars,
  getAdminCars,
  getCarById,
  updateCar,
  deleteCarImage,
  deleteCar,
  addReview,
};
