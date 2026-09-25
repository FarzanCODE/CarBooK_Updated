import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import {
  Car,
  Shield,
  Clock,
  CreditCard,
  Star,
  MapPin,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const categories = [
  { name: "Sedan", icon: "🚗", desc: "Comfortable city rides" },
  { name: "SUV", icon: "🚙", desc: "Spacious family trips" },
  { name: "Luxury", icon: "🏎️", desc: "Premium experience" },
  { name: "Electric", icon: "⚡", desc: "Eco friendly drives" },
  { name: "Bike/Scooter", icon: "🛵", desc: "Quick city commutes" },
  { name: "Mini/Hatchback", icon: "🚘", desc: "Budget friendly rides" },
];

const features = [
  {
    icon: <Shield size={32} className="text-primary" />,
    title: "Fully Insured",
    desc: "All our vehicles come with comprehensive insurance coverage for your safety.",
  },
  {
    icon: <Clock size={32} className="text-primary" />,
    title: "24/7 Support",
    desc: "Round the clock customer support for any help you need during your trip.",
  },
  {
    icon: <CreditCard size={32} className="text-primary" />,
    title: "Easy Payments",
    desc: "Secure payments via Razorpay. Pay per hour, day, week or choose a package.",
  },
  {
    icon: <Star size={32} className="text-primary" />,
    title: "Top Rated Cars",
    desc: "Only the best maintained and highest rated cars make it to our fleet.",
  },
];

const Home = () => {
  const { user } = useAuth();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [homeSettings, setHomeSettings] = useState(null);
  const [, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get("/home-settings");
        setHomeSettings(data.settings);
      } catch {
        setHomeSettings(null);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return toast.error("Please fill in all fields");
    }
    setContactLoading(true);
    try {
      await axiosInstance.post("/contact", contactForm);
      toast.success("Message sent! We will get back to you soon.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-black"></div>

        <div className="absolute top-20 right-20 w-72 h-72 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Drive Your
            <span className="text-primary block">Dream Car</span>
            Today
          </h1>

          <p className="text-gray-400 text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
            Premium cars at your fingertips. Book instantly, drive confidently.
            Sedans, SUVs, Luxury — we have it all.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cars"
              className="bg-gradient-primary hover:shadow-dark-neumorphic-sm text-white font-semibold px-8 py-4 rounded-full border-0 text-lg flex items-center justify-center gap-2 transition-all"
            >
              <Car size={20} />
              Browse Cars
            </Link>

            {!user ? (
              <Link
                to="/register"
                className="bg-card shadow-dark-neumorphic-sm hover:shadow-dark-neumorphic text-primary font-semibold px-8 py-4 rounded-full border border-gray-800 text-lg transition-all"
              >
                Get Started Free
              </Link>
            ) : (
              <Link
                to="/my-bookings"
                className="bg-card shadow-dark-neumorphic-sm hover:shadow-dark-neumorphic text-primary font-semibold px-8 py-4 rounded-full border border-gray-800 text-lg transition-all"
              >
                My Bookings
              </Link>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { value: "Secure", label: "Cookie-based Auth" },
              { value: "RBAC", label: "Admin Controls" },
              { value: "Live", label: "Razorpay Payments" },
              { value: "Real-time", label: "Booking Checks" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Browse by <span className="text-primary">Category</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Find the perfect car for every occasion
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/cars?category=${cat.name}`}
                className="bg-background shadow-dark-neumorphic hover:shadow-dark-neumorphic-sm border-0 rounded-2xl p-6 text-center transition-all group"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className="text-white font-semibold group-hover:text-primary transition-colors">
                  {cat.name}
                </div>
                <div className="text-gray-500 text-xs mt-1">{cat.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Book your car in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Car",
                desc: "Browse our wide collection of cars, filter by category, price or location.",
                icon: "🚗",
              },
              {
                step: "02",
                title: "Book & Pay",
                desc: "Select your dates, choose hourly, daily or weekly pricing and pay securely.",
                icon: "💳",
              },
              {
                step: "03",
                title: "Hit the Road",
                desc: "Pick up your car at the location and enjoy your ride!",
                icon: "🛣️",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-primary/30"></div>
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 border-2 border-primary/30 rounded-full text-4xl mb-6">
                  {item.icon}
                </div>
                <div className="text-primary text-sm font-bold mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-white text-xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-primary">CarBook</span>
            </h2>
            <p className="text-gray-400 text-lg">
              We make car rentals simple, safe and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-background shadow-dark-neumorphic hover:shadow-dark-neumorphic-sm border-0 rounded-2xl p-6 transition-all hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Our <span className="text-primary">Customers Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(homeSettings?.testimonials || []).map((t) => (
              <div
                key={t._id}
                className="bg-card shadow-dark-neumorphic border-0 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array(t.rating)
                    .fill()
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="text-white font-semibold">{t.name}</div>
                  <div className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin size={12} />
                    {t.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Hit the Road?
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Browse the fleet, choose your dates, and complete a verified
            reservation flow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cars"
              className="bg-gradient-primary hover:shadow-dark-neumorphic text-white font-bold px-8 py-4 rounded-full border-0 text-lg transition-all flex items-center justify-center gap-2"
            >
              <Car size={20} />
              Browse All Cars
            </Link>
            {!user && (
              <Link
                to="/register"
                className="bg-card shadow-dark-neumorphic hover:shadow-dark-neumorphic-sm text-white font-bold px-8 py-4 rounded-full border border-gray-800 text-lg transition-all"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Meet the <span className="text-primary">Owner</span>
              </h3>
              <div className="h-1 w-16 bg-primary rounded mb-6"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary/20 border-2 border-primary rounded-full overflow-hidden flex items-center justify-center text-2xl">
                  {homeSettings?.founder?.image ? (
                    <img
                      src={homeSettings.founder.image}
                      alt="founder"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "👨‍💼"
                  )}
                </div>
                <div>
                  <div className="text-white text-xl font-bold">
                    {homeSettings?.founder?.name || "Md Farzan Farooquee"}
                  </div>
                  <div className="text-primary">
                    {homeSettings?.founder?.role || "Developer, CarBook"}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                {homeSettings?.founder?.bio ||
                  "Passionate about making car rentals accessible, affordable and hassle-free for everyone across India."}
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:farzan.farooquee@gmail.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
                >
                  <Mail size={18} className="text-primary" />
                  farzan.farooquee@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-background shadow-dark-neumorphic border-0 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Send us a Message
              </h3>
              <form
                onSubmit={handleContactSubmit}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  required
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="bg-card text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="bg-gradient-primary border-0 hover:shadow-dark-neumorphic text-white font-semibold py-3 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  {contactLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-gray-800 pt-36 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car size={24} className="text-primary" />
                <span className="text-white text-xl font-bold">
                  Car<span className="text-primary">Book</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted car rental platform. Drive premium cars at
                affordable prices.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {["Home", "Cars", "My Bookings", "Profile"].map((link) => (
                  <Link
                    key={link}
                    to={`/${link === "Home" ? "" : link.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Categories</h4>
              <div className="flex flex-col gap-2">
                {["Sedan", "SUV", "Luxury", "Electric"].map((cat) => (
                  <Link
                    key={cat}
                    to={`/cars?category=${cat}`}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:farzan.farooquee@gmail.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  <Mail size={14} />
                  farzan.farooquee@gmail.com
                </a>
              </div>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://www.linkedin.com/in/md-farzan-farooquee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-card border border-gray-700 hover:border-primary hover:text-primary text-gray-400 rounded-lg flex items-center justify-center transition-colors text-sm"
                  title="LinkedIn"
                >
                  <FaLinkedin size={18} />
                </a>
                <a
                  href="https://github.com/FarzanCODE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-card border border-gray-700 hover:border-primary hover:text-primary text-gray-400 rounded-lg flex items-center justify-center transition-colors text-sm"
                  title="GitHub"
                >
                  <FaGithub size={18} />
                </a>
                <a
                  href="https://www.instagram.com/farzan_farooquee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-card border border-gray-700 hover:border-primary hover:text-primary text-gray-400 rounded-lg flex items-center justify-center transition-colors text-sm"
                  title="Instagram"
                >
                  <FaInstagram size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 CarBook by Md Farzan Farooquee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
