import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Lock, User, Phone, Car, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.phone) {
      const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        toast.error(
          "Enter a valid Indian phone number (10 digits starting with 6-9)",
        );
        return;
      }
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/[\s-]/g, ""),
        password: formData.password,
      });

      login(data.user);
      toast.success(`Account created successfully`);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-36 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Car size={48} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Join <span className="text-primary">CarBook</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Create your account and start exploring
          </p>
        </div>

        <div className="bg-background rounded-2xl p-8 shadow-dark-neumorphic border-0">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl mb-6 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">
              or register with email
            </span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Full Name *</label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Md Farzan Farooquee"
                  className={`w-full bg-card text-white pl-10 pr-4 py-3 rounded-xl border transition-colors
        ${
          formData.name && formData.name.trim().length < 2
            ? "border-red-500" 
            : formData.name
              ? "border-green-500" 
              : "border-gray-700" 
        }`}
                />
              </div>
              {formData.name && formData.name.trim().length < 2 && (
                <p className="text-red-400 text-xs mt-1">
                  Name must be at least 2 characters
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Email Address *</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="farzan@example.com"
                  className={`w-full bg-card text-white pl-10 pr-4 py-3 rounded-xl border transition-colors
        ${
          formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
            ? "border-red-500"
            : formData.email
              ? "border-green-500"
              : "border-gray-700"
        }`}
                />
              </div>
              {formData.email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <p className="text-red-400 text-xs mt-1">
                    Please enter a valid email address
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Phone Number</label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full bg-card text-white pl-10 pr-4 py-3 rounded-xl border transition-colors
        ${
          formData.phone &&
          !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ""))
            ? "border-red-500"
            : formData.phone
              ? "border-green-500"
              : "border-gray-700"
        }`}
                />
              </div>
              {formData.phone &&
                !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(
                  formData.phone.replace(/\s/g, ""),
                ) && (
                  <p className="text-red-400 text-xs mt-1">
                    Enter valid Indian number (e.g. 9876543210)
                  </p>
                )}
            </div>

            
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Password *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className={`w-full bg-card text-white pl-10 pr-10 py-3 rounded-xl border transition-colors ${formData.password && formData.password.length < 6 ? "border-red-500" : formData.password ? "border-green-500" : "border-gray-700"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-sm">Confirm Password *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full bg-card text-white pl-10 pr-10 py-3 rounded-xl border transition-colors ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500" : formData.confirmPassword && formData.password === formData.confirmPassword ? "border-green-500" : "border-gray-700"}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full py-4 text-white font-bold text-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-semibold"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
