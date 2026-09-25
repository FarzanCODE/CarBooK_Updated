import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Car,
  Clock,
  X,
  Star,
  Check,
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

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [reviewModal, setReviewModal] = useState({
    open: false,
    carId: null,
    bookingId: null,
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/bookings/my-bookings");
      setBookings(data.bookings);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    setCancellingId(bookingId);
    try {
      await axiosInstance.put(`/bookings/${bookingId}/cancel`, {
        cancellationReason: "Cancelled by user",
      });
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed");
    } finally {
      setCancellingId(null);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await axiosInstance.post(`/cars/${reviewModal.carId}/review`, {
        rating: reviewModal.rating,
        comment: reviewModal.comment,
      });
      toast.success("Review submitted!");
      setReviewModal({
        open: false,
        carId: null,
        bookingId: null,
        rating: 5,
        comment: "",
      });
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  if (loading) return <Loader />;

  const tabs = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="min-h-screen px-4 pt-36 pb-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          My <span className="text-primary">Bookings</span>
        </h1>
        <p className="text-gray-400">{bookings.length} total bookings</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-colors
              ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-background border border-gray-700 text-gray-400 hover:border-primary hover:text-primary"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-20">
          <Car size={60} className="mx-auto text-gray-700 mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">
            No bookings found
          </h3>
          <p className="text-gray-400">
            You have no {activeTab !== "all" ? activeTab : ""} bookings yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-background border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-card shrink-0">
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
                        Booking ID: {booking._id.slice(-8).toUpperCase()}
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
                        ₹{booking.totalAmount?.toLocaleString("en-IN")}
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
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}

                    {booking.status === "completed" && !booking.isReviewed && (
                      <button
                        onClick={() =>
                          setReviewModal({
                            open: true,
                            carId: booking.car._id,
                            bookingId: booking._id,
                            rating: 5,
                            comment: "",
                          })
                        }
                        className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-xl text-sm transition-colors"
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
          ))}
        </div>
      )}

      {reviewModal.open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setReviewModal({ ...reviewModal, open: false })}
        >
          <div
            className="bg-background border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-xl mb-6">
              Write a Review
            </h3>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-3 block">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setReviewModal({ ...reviewModal, rating: star })
                    }
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={
                        star <= reviewModal.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewModal.comment}
              onChange={(e) =>
                setReviewModal({ ...reviewModal, comment: e.target.value })
              }
              placeholder="Share your experience..."
              rows={4}
              className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal({ ...reviewModal, open: false })}
                className="flex-1 bg-card hover:bg-gray-700 text-gray-400 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="flex-1 bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full  transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
