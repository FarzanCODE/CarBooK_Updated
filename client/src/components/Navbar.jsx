import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Car,
  User,
  LogOut,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute top-6 left-0 w-full z-50 pointer-events-none px-4"
    >
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between pointer-events-auto bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full">
        
        <div className="flex-1 flex justify-start">
        <Link to="/" className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 15 }}>
            <Car className="text-primary" size={28} />
          </motion.div>
          <span className="text-white text-xl font-bold">
            Car<span className="text-primary">Book</span>
          </span>
        </Link>
        </div>

        <div className="hidden md:flex flex-shrink-0 items-center justify-center gap-8">
          {["Home", "Cars"].map((item) => (
            <Link
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
              className="text-gray-300 hover:text-primary transition-all font-medium relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
          {user && (
            <Link
              to="/my-bookings"
              className="text-gray-300 hover:text-primary transition-all font-medium relative group"
            >
              My Bookings
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="text-gray-300 hover:text-primary transition-all font-medium relative group"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          )}
        </div>

        <div className="hidden md:flex flex-1 items-center justify-end gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <User size={20} className="text-primary" />
                )}
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-card hover:bg-card/80 text-textMain px-4 py-2 rounded-full transition-all border border-gray-800"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-primary transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/30 px-6 py-2 rounded-full transition-all font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="md:hidden bg-white/5 backdrop-blur-2xl px-6 py-6 flex flex-col gap-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl mt-4 pointer-events-auto overflow-hidden"
          >
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-primary font-medium"
            >
              Home
            </Link>
            <Link
              to="/cars"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-primary font-medium"
            >
              Cars
            </Link>

            {user && (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 hover:text-primary flex items-center gap-2 font-medium"
                >
                  <BookOpen size={16} /> My Bookings
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 hover:text-primary flex items-center gap-2 font-medium"
                >
                  <User size={16} /> Profile
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-primary flex items-center gap-2 font-medium"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-primary hover:text-red-400 font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 hover:text-primary font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-gradient-primary text-white font-semibold px-4 py-3 rounded-full text-center hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
