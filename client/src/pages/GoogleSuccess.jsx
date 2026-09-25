import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleSuccess = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    refreshUser().then((user) => {
      if (!user) {
        toast.error("Google sign-in failed");
        navigate("/login", { replace: true });
        return;
      }
      toast.success(`Welcome, ${user.name}`);
      navigate("/", { replace: true });
    });
  }, [navigate, refreshUser]);

  return <div className="min-h-screen grid place-items-center"><div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
};

export default GoogleSuccess;
