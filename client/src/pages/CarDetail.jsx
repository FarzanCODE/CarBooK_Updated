import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  MapPin,
  Star,
  Users,
  Fuel,
  Settings,
  Car,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Check,
  AlertCircle,
} from "lucide-react";

const CarDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/cars/${id}`);
      setCar(data.car);
    } catch (error) {
      toast.error("Car not found");
      navigate("/cars");
    } finally {
      setLoading(false);
    }
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev === car.images.length - 1 ? 0 : prev + 1));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }
    setReviewLoading(true);
    try {
      await axiosInstance.post(`/cars/${id}/review`, reviewForm);
      toast.success("Review submitted!");
      fetchCar();
      setReviewForm({ rating: 5, comment: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!car) return null;

  return (
    <div className="min-h-screen px-4 pt-36 pb-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Cars
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="relative h-80 md:h-96 bg-background rounded-2xl overflow-hidden mb-4">
            {car.images && car.images.length > 0 ? (
              <>
                <img
                  src={car.images[activeImage]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {activeImage + 1} / {car.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🚗
              </div>
            )}
          </div>

          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors
                    ${activeImage === index ? "border-primary" : "border-gray-700 hover:border-gray-500"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="bg-background border border-gray-800 rounded-2xl p-6 mt-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <Users size={16} />,
                  label: "Seats",
                  value: car.specs?.seats,
                },
                {
                  icon: <Fuel size={16} />,
                  label: "Fuel Type",
                  value: car.specs?.fuelType,
                },
                {
                  icon: <Settings size={16} />,
                  label: "Transmission",
                  value: car.specs?.transmission,
                },
                {
                  icon: <Car size={16} />,
                  label: "Year",
                  value: car.specs?.year || "N/A",
                },
                {
                  icon: <Shield size={16} />,
                  label: "Mileage",
                  value: car.specs?.mileage || "N/A",
                },
                {
                  icon: <MapPin size={16} />,
                  label: "Location",
                  value: car.location,
                },
              ].map((spec) => (
                <div key={spec.label} className="flex items-center gap-3">
                  <div className="text-primary">{spec.icon}</div>
                  <div>
                    <div className="text-gray-500 text-xs">{spec.label}</div>
                    <div className="text-white text-sm font-semibold">
                      {spec.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/30">
              {car.category}
            </span>
            <h1 className="text-4xl font-bold text-white mt-3 mb-1">
              {car.brand} {car.name}
            </h1>
            <div className="flex items-center gap-3 text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                {car.location}
              </div>
              {car.totalReviews > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">
                    {car.averageRating.toFixed(1)}
                  </span>
                  <span>({car.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6
            ${
              car.isAvailable
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            {car.isAvailable ? (
              <>
                <Check size={14} /> Available for Booking
              </>
            ) : (
              <>
                <AlertCircle size={14} /> Currently Unavailable
              </>
            )}
          </div>

          {car.description && (
            <p className="text-gray-400 mb-6 leading-relaxed">
              {car.description}
            </p>
          )}

          <div className="bg-background border border-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Pricing Options
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {car.pricing.perHour > 0 && (
                <div className="bg-card rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Per Hour</div>
                  <div className="text-primary font-bold text-xl">
                    ₹{car.pricing.perHour?.toLocaleString("en-IN")}
                  </div>
                </div>
              )}
              {car.pricing.perDay > 0 && (
                <div className="bg-card rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Per Day</div>
                  <div className="text-primary font-bold text-xl">
                    ₹{car.pricing.perDay?.toLocaleString("en-IN")}
                  </div>
                </div>
              )}
              {car.pricing.perWeek > 0 && (
                <div className="bg-card rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Per Week</div>
                  <div className="text-primary font-bold text-xl">
                    ₹{car.pricing.perWeek?.toLocaleString("en-IN")}
                  </div>
                </div>
              )}
            </div>

            {car.pricing.packages && car.pricing.packages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-gray-400 text-sm mb-3">Special Packages</h4>
                <div className="flex flex-col gap-2">
                  {car.pricing.packages.map((pkg, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-card rounded-xl p-3 border border-gray-700"
                    >
                      <div>
                        <div className="text-white font-semibold">
                          {pkg.label}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {pkg.durationDays} days
                        </div>
                      </div>
                      <div className="text-primary font-bold">₹{pkg.price?.toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {car.isAvailable ? (
            user ? (
              <Link
                to={`/booking/${car._id}`}
                className="w-full bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full  text-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar size={20} />
                Book Now
              </Link>
            ) : (
              <div className="bg-background border border-primary/30 rounded-2xl p-5 text-center">
                <p className="text-gray-400 mb-3">
                  Please login to book this car
                </p>
                <Link
                  to="/login"
                  className="bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full  transition-colors"
                >
                  Login to Book
                </Link>
              </div>
            )
          ) : (
            <button
              disabled
              className="w-full bg-gray-700 text-gray-400 font-bold py-4 rounded-xl text-lg cursor-not-allowed"
            >
              Currently Unavailable
            </button>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Reviews <span className="text-primary">({car.totalReviews})</span>
        </h2>

        {user && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-background border border-gray-800 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-white font-bold mb-4">Write a Review</h3>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={
                        star <= reviewForm.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              placeholder="Share your experience with this car..."
              rows={3}
              className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors resize-none mb-4"
            />

            <button
              type="submit"
              disabled={reviewLoading}
              className="bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {car.reviews && car.reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {car.reviews.map((review, index) => (
              <div
                key={index}
                className="bg-background border border-gray-800 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold">
                        {review.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-semibold">
                        {review.user?.name || "User"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(review.createdAt).toDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {Array(review.rating)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-300">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetail;
