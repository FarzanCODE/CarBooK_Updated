import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cars from "../pages/Cars";
import CarDetail from "../pages/CarDetail";
import Booking from "../pages/Booking";
import MyBookings from "../pages/MyBookings";
import Profile from "../pages/Profile";
import Dashboard from "../pages/admin/Dashboard";
import GoogleSuccess from "../pages/GoogleSuccess";

import ProtectedRoute from "./ProtectedRoute";
import AnimatedPage from "./AnimatedPage";

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/cars" element={<AnimatedPage><Cars /></AnimatedPage>} />
        <Route path="/cars/:id" element={<AnimatedPage><CarDetail /></AnimatedPage>} />
        <Route path="/auth/google/success" element={<GoogleSuccess />} />
        <Route
          path="/booking/:carId"
          element={
            <ProtectedRoute>
              <AnimatedPage><Booking /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <AnimatedPage><MyBookings /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AnimatedPage><Profile /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AnimatedPage><Dashboard /></AnimatedPage>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
