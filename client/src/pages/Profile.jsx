import { useState } from "react";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff, Save } from "lucide-react";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await axiosInstance.put(
        "/auth/profile",
        profileData,
      );
      setUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await axiosInstance.put("/auth/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-36 pb-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">
        My <span className="text-primary">Profile</span>
      </h1>

      <div className="bg-background border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
        
        <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-white text-2xl font-bold">{user?.name}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block
            ${
              user?.role === "admin"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
            }`}
          >
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-background border border-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-white font-bold text-xl mb-6">Update Profile</h3>
        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Full Name</label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full bg-card text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">
              Email (cannot be changed)
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-card text-gray-600 pl-10 pr-4 py-3 rounded-xl border border-gray-800 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Phone Number</label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
                className="w-full bg-card text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="flex items-center justify-center gap-2 bg-gradient-primary hover:shadow-dark-neumorphic-sm transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            <Save size={16} />
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {!user?.isGoogleUser && (
        <div className="bg-background border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
            {[
              {
                key: "current",
                label: "Current Password",
                field: "currentPassword",
              },
              { key: "new", label: "New Password", field: "newPassword" },
              {
                key: "confirm",
                label: "Confirm New Password",
                field: "confirmPassword",
              },
            ].map((item) => (
              <div key={item.key} className="flex flex-col gap-1">
                <label className="text-gray-400 text-sm">{item.label}</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type={showPasswords[item.key] ? "text" : "password"}
                    value={passwordData[item.field]}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        [item.field]: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full bg-card text-white pl-10 pr-12 py-3 rounded-xl border border-gray-700 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        [item.key]: !showPasswords[item.key],
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    {showPasswords[item.key] ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center justify-center gap-2 bg-card hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl border border-gray-700 transition-colors"
            >
              <Lock size={16} />
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
