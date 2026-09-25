import { Link } from "react-router-dom";
import { MapPin, Star, Users, Fuel, Settings } from "lucide-react";

const CarCard = ({ car }) => {
  const getStartingPrice = () => {
    const { perHour, perDay, perWeek } = car.pricing;
    if (perHour > 0) return { amount: perHour, label: "/hour" };
    if (perDay > 0) return { amount: perDay, label: "/day" };
    if (perWeek > 0) return { amount: perWeek, label: "/week" };
    return { amount: 0, label: "" };
  };

  const price = getStartingPrice();

  return (
    <div className="bg-card shadow-dark-neumorphic border-0 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 group">
      <div className="relative h-48 overflow-hidden bg-background">
        {car.images && car.images.length > 0 ? (
          <img
            src={car.images[0]}
            alt={car.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              !car.isAvailable ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🚗
          </div>
        )}

        <div className="absolute top-3 left-3 bg-gradient-primary border-0 text-white text-xs font-semibold px-3 py-1 rounded-full px-4">
          {car.category}
        </div>

        <div
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full
          ${
            car.isAvailable
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {car.isAvailable ? "Available" : "Unavailable"}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">
            {car.brand} {car.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={12} />
            {car.location}
          </div>
        </div>

        {car.totalReviews > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-semibold">
              {car.averageRating.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">
              ({car.totalReviews} reviews)
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Users size={12} />
            {car.specs?.seats} seats
          </div>
          <div className="flex items-center gap-1">
            <Fuel size={12} />
            {car.specs?.fuelType}
          </div>
          <div className="flex items-center gap-1">
            <Settings size={12} />
            {car.specs?.transmission}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary font-bold text-xl">
              ₹{price.amount?.toLocaleString("en-IN")}
            </span>
            <span className="text-gray-500 text-sm">{price.label}</span>
          </div>
          <Link
            to={`/cars/${car._id}`}
            className="bg-gradient-primary hover:shadow-dark-neumorphic-sm text-white text-sm font-semibold px-6 py-2 rounded-full transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
