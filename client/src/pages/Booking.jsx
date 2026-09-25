import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Car,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  ArrowLeft,
  Check,
} from "lucide-react";

const Booking = () => {
  const { carId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [bookingData, setBookingData] = useState({
    bookingType: "daily",
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropLocation: "",
    selectedPackage: null,
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    fetchCar();
  }, [carId]);

  useEffect(() => {
    calculatePrice();
  }, [
    bookingData.bookingType,
    bookingData.startDate,
    bookingData.endDate,
    bookingData.selectedPackage,
  ]);

  const fetchCar = async () => {
    try {
      const { data } = await axiosInstance.get(`/cars/${carId}`);
      setCar(data.car);
    } catch {
      toast.error("Car not found");
      navigate("/cars");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!car) return;

    const { bookingType, startDate, endDate, selectedPackage } = bookingData;

    if (bookingType === "package" && selectedPackage) {
      setCalculatedPrice(selectedPackage.price);
      return;
    }

    if (!startDate || !endDate) {
      setCalculatedPrice(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;

    if (diffMs <= 0) {
      setCalculatedPrice(0);
      return;
    }

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const diffWeeks = diffDays / 7;

    let price = 0;
    if (bookingType === "hourly")
      price = Math.ceil(diffHours) * car.pricing.perHour;
    if (bookingType === "daily")
      price = Math.ceil(diffDays) * car.pricing.perDay;
    if (bookingType === "weekly")
      price = Math.ceil(diffWeeks) * car.pricing.perWeek;

    setCalculatedPrice(price);
  };

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const handleBooking = async () => {
    if (!bookingData.pickupLocation) {
      toast.error("Please enter pickup location");
      return;
    }

    if (
      !bookingData.startDate ||
      (bookingData.bookingType !== "package" && !bookingData.endDate)
    ) {
      toast.error("Please select the required booking dates");
      return;
    }

    if (calculatedPrice <= 0) {
      toast.error("Invalid booking duration");
      return;
    }

    setPaying(true);
    let pendingBookingId = null;

    try {
      const { data } = await axiosInstance.post("/bookings", {
        carId: carId,
        bookingType: bookingData.bookingType,
        startDate: new Date(bookingData.startDate).toISOString(),
        endDate:
          bookingData.bookingType === "package"
            ? undefined
            : new Date(bookingData.endDate).toISOString(),
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation,
        packageId:
          bookingData.bookingType === "package"
            ? bookingData.selectedPackage?._id
            : undefined,
      });

      pendingBookingId = data.booking._id;
      if (!window.Razorpay) throw new Error("Razorpay checkout failed to load");

      const options = {
        key: data.razorpayOrder.key,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "CarBook",
        description: `${car.brand} ${car.name} — ${bookingData.bookingType}`,
        order_id: data.razorpayOrder.id,

        handler: async (response) => {
          try {
            const verifyRes = await axiosInstance.post(
              "/bookings/verify-payment",
              {
                bookingId: data.booking._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            );

            if (verifyRes.data.success) {
              toast.success("Payment successful! Booking confirmed 🎉");
              navigate("/my-bookings");
            }
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: async () => {
            try {
              await axiosInstance.put(`/bookings/${data.booking._id}/cancel`, {
                cancellationReason: "Payment checkout closed",
              });
            } catch {
              toast.error("Payment cancellation could not be recorded");
            }
            toast.error("Payment cancelled");
            setPaying(false);
          },
        },

        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },

        theme: {
          color: "#8b5cf6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      if (pendingBookingId) {
        try {
          await axiosInstance.put(`/bookings/${pendingBookingId}/cancel`, {
            cancellationReason: "Checkout could not start",
          });
        } catch {
          toast.error("Pending booking cleanup failed");
        }
      }
      toast.error(
        error.response?.data?.message || error.message || "Booking failed",
      );
      setPaying(false);
    }
  };

  if (loading) return <Loader />;
  if (!car) return null;

  const hasHourly = car.pricing.perHour > 0;
  const hasDaily = car.pricing.perDay > 0;
  const hasWeekly = car.pricing.perWeek > 0;
  const hasPackage = car.pricing.packages && car.pricing.packages.length > 0;

  return (
    <div className="min-h-screen px-4 pt-36 pb-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">
        Book{" "}
        <span className="text-primary">
          {car.brand} {car.name}
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-background border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Select Booking Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  type: "hourly",
                  label: "Hourly",
                  price: car.pricing.perHour,
                  show: hasHourly,
                },
                {
                  type: "daily",
                  label: "Daily",
                  price: car.pricing.perDay,
                  show: hasDaily,
                },
                {
                  type: "weekly",
                  label: "Weekly",
                  price: car.pricing.perWeek,
                  show: hasWeekly,
                },
                {
                  type: "package",
                  label: "Package",
                  price: null,
                  show: hasPackage,
                },
              ]
                .filter((item) => item.show)
                .map((item) => (
                  <button
                    key={item.type}
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        bookingType: item.type,
                        selectedPackage: null,
                      })
                    }
                    className={`p-4 rounded-xl border-2 text-center transition-all
                    ${
                      bookingData.bookingType === item.type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    {item.price && (
                      <div className="text-sm mt-1">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {bookingData.bookingType === "package" && (
            <div className="bg-background border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Choose a Package
              </h3>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">
                  <Clock size={14} className="inline mr-1" />
                  Package Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-3">
                {car.pricing.packages.map((pkg, i) => (
                  <button
                    key={pkg._id || i}
                    onClick={() =>
                      setBookingData({ ...bookingData, selectedPackage: pkg })
                    }
                    className={`flex justify-between items-center p-4 rounded-xl border-2 transition-all
                      ${
                        bookingData.selectedPackage?._id === pkg._id
                          ? "border-primary bg-primary/10"
                          : "border-gray-700 hover:border-gray-500"
                      }`}
                  >
                    <div className="text-left">
                      <div className="text-white font-semibold">
                        {pkg.label}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {pkg.durationDays} days included
                      </div>
                    </div>
                    <div className="text-primary font-bold text-xl">
                      ₹{pkg.price?.toLocaleString("en-IN")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {bookingData.bookingType !== "package" && (
            <div className="bg-background border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Select Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    <Clock size={14} className="inline mr-1" />
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={bookingData.startDate}
                    onChange={handleChange}
                    min={getMinDate()}
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    <Clock size={14} className="inline mr-1" />
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={bookingData.endDate}
                    onChange={handleChange}
                    min={bookingData.startDate || getMinDate()}
                    className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-background border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Location Details
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  <MapPin size={14} className="inline mr-1" />
                  Pickup Location *
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai Airport Terminal 2"
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  <MapPin size={14} className="inline mr-1" />
                  Drop Location (optional)
                </label>
                <input
                  type="text"
                  name="dropLocation"
                  value={bookingData.dropLocation}
                  onChange={handleChange}
                  placeholder="e.g. Pune Station"
                  className="w-full bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-background border border-gray-800 rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
              {car.images?.[0] ? (
                <img
                  src={car.images[0]}
                  alt={car.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-card flex items-center justify-center text-3xl">
                  🚗
                </div>
              )}
              <div>
                <div className="text-white font-bold">
                  {car.brand} {car.name}
                </div>
                <div className="text-gray-500 text-sm flex items-center gap-1">
                  <MapPin size={12} /> {car.location}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <h3 className="text-white font-bold">Booking Summary</h3>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking Type</span>
                <span className="text-white capitalize">
                  {bookingData.bookingType}
                </span>
              </div>

              {bookingData.selectedPackage && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Package</span>
                  <span className="text-white">
                    {bookingData.selectedPackage.label}
                  </span>
                </div>
              )}

              {bookingData.startDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Start</span>
                  <span className="text-white">
                    {new Date(bookingData.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {bookingData.endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">End</span>
                  <span className="text-white">
                    {new Date(bookingData.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {bookingData.pickupLocation && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pickup</span>
                  <span className="text-white text-right max-w-[120px] truncate">
                    {bookingData.pickupLocation}
                  </span>
                </div>
              )}

              <div className="h-px bg-gray-800 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Total Amount</span>
                <span className="text-primary font-bold text-2xl">
                  {calculatedPrice > 0
                    ? `₹${calculatedPrice?.toLocaleString("en-IN")}`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 mb-6">
              <h4 className="text-white text-sm font-semibold mb-3">
                What's Included
              </h4>
              {[
                "Fully insured vehicle",
                "Free cancellation",
                "24/7 support",
                "Instant confirmation",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-gray-400 text-xs mb-2"
                >
                  <Check size={12} className="text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={handleBooking}
              disabled={paying || calculatedPrice === 0}
              className="w-full bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed border-0 flex items-center justify-center gap-2"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay ₹{calculatedPrice?.toLocaleString("en-IN") || "—"}
                </>
              )}
            </button>

            <p className="text-gray-600 text-xs text-center mt-3">
              Secured by Razorpay 🔒
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
