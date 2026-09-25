import {
  MapPin,
  Calendar,
  Check,
  Clock,
  X,
  Star,
  AlertCircle,
} from "lucide-react";

const getStatusStyle = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-green-500/10 text-green-400 border-green-500/30";
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "completed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/30";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
      return <Check size={12} />;
    case "pending":
      return <Clock size={12} />;
    case "cancelled":
      return <X size={12} />;
    case "completed":
      return <Star size={12} />;
    default:
      return <AlertCircle size={12} />;
  }
};

const BookingCard = ({ booking, onCancel, onReview, cancelling }) => {
  return (
    <div className="bg-card shadow-dark-neumorphic border-0 rounded-2xl p-6 transition-all hover:-translate-y-1">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-background shrink-0 shadow-dark-neumorphic-inset">
          {booking.car?.images?.[0] ? (
            <img
              src={booking.car.images[0]}
              alt={booking.car.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🚗
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-white font-bold text-lg">
                {booking.car?.brand} {booking.car?.name}
              </h3>
              <p className="text-gray-500 text-sm">
                ID: {booking._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusStyle(booking.status)}`}
            >
              {getStatusIcon(booking.status)}
              {booking.status}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="text-gray-500 text-xs mb-1">Type</div>
              <div className="text-white text-sm capitalize font-semibold">
                {booking.bookingType}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Start</div>
              <div className="text-white text-sm font-semibold">
                {new Date(booking.startDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">End</div>
              <div className="text-white text-sm font-semibold">
                {new Date(booking.endDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Amount</div>
              <div className="text-primary text-sm font-bold">
                ₹{booking.totalAmount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
            <MapPin size={13} className="text-primary" />
            {booking.pickupLocation}
            {booking.dropLocation && ` → ${booking.dropLocation}`}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-500 text-xs">Payment:</span>
            <span
              className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full
              ${
                booking.payment?.status === "paid"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {booking.payment?.status || "pending"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {["pending", "confirmed"].includes(booking.status) && (
              <button
                onClick={() => onCancel(booking._id)}
                disabled={cancelling}
                className="flex items-center gap-2 bg-background hover:bg-background/80 text-red-500 shadow-dark-neumorphic-sm px-4 py-2 rounded-full text-sm transition-all disabled:opacity-50 border border-red-500/30"
              >
                <X size={14} />
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}

            {booking.status === "completed" && !booking.isReviewed && (
              <button
                onClick={() => onReview(booking.car._id, booking._id)}
                className="flex items-center gap-2 bg-gradient-primary hover:shadow-dark-neumorphic-sm text-white px-4 py-2 border-0 rounded-full text-sm transition-all"
              >
                <Star size={14} />
                Write a Review
              </button>
            )}

            {booking.status === "completed" && booking.isReviewed && (
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <Check size={14} /> Review submitted
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
