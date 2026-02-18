import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Edit,
  X,
  Phone,
} from "lucide-react";

const Settings = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      // Initialize profile data for editing
      setProfileData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleCancelEdit = () => {
    // Reset to original profile data
    setProfileData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
    });
    setEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!profileData.firstName || !profileData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!profileData.lastName || !profileData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (!profileData.email || !profileData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!profileData.phoneNumber || !profileData.phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setSavingProfile(true);
    try {
      const result = await userService.updateProfile(profileData);
      toast.success(result.message || "Profile updated successfully");
      setEditingProfile(false);
      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const result = await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword,
      );

      toast.success(result.message || "Password changed successfully");

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Logout user after 2 seconds and redirect to login
      setTimeout(() => {
        toast.loading("Redirecting to login...");
        logout();
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#4A2F19] animate-spin" />
          <p className="text-[#4A2F19] font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Settings</h1>
          <p className="text-[#6B4423]">
            Manage your profile and account settings
          </p>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white rounded-xl shadow-coffee-md p-6 mb-6 border border-[#C8A27B]/30">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#C8A27B]/30">
            <div className="flex items-center gap-3">
              <div className="coffee-gradient p-3 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                Profile Information
              </h2>
            </div>
            {!editingProfile && (
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A2F19] hover:bg-[#6B4423] text-white rounded-lg font-semibold transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {editingProfile ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                    placeholder="Enter first name"
                    disabled={savingProfile}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                    placeholder="Enter last name"
                    disabled={savingProfile}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                    placeholder="Enter email"
                    disabled={savingProfile}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                    placeholder="Enter phone number"
                    disabled={savingProfile}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="coffee-gradient text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all duration-200 shadow-coffee-md hover:shadow-coffee-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <User className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    First Name
                  </p>
                  <p className="text-[#1A1A1A] font-bold">
                    {profile?.firstName || "Not set"}
                  </p>
                </div>
              </div>

              {/* Last Name */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <User className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Last Name
                  </p>
                  <p className="text-[#1A1A1A] font-bold">
                    {profile?.lastName || "Not set"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Email
                  </p>
                  <p className="text-[#1A1A1A] font-bold">{profile?.email}</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Phone Number
                  </p>
                  <p className="text-[#1A1A1A] font-bold">
                    {profile?.phoneNumber || "Not set"}
                  </p>
                </div>
              </div>

              {/* Username (Read-only) */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <User className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Username
                  </p>
                  <p className="text-[#1A1A1A] font-bold">
                    {profile?.username}
                  </p>
                </div>
              </div>

              {/* Role (Read-only) */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Role
                  </p>
                  <span className="inline-block px-3 py-1 bg-[#4A2F19] text-white text-sm font-bold rounded-lg">
                    {profile?.role}
                  </span>
                </div>
              </div>

              {/* Account Status (Read-only) */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Account Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-bold rounded-lg ${
                      profile?.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {profile?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Created At (Read-only) */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Member Since
                  </p>
                  <p className="text-[#1A1A1A] font-bold">
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>

              {/* Last Updated (Read-only) */}
              <div className="flex items-start gap-3">
                <div className="bg-[#EFE7D3] p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#4A2F19]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Last Updated
                  </p>
                  <p className="text-[#1A1A1A] font-bold">
                    {formatDate(profile?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-xl shadow-coffee-md p-6 border border-[#C8A27B]/30">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#C8A27B]/30">
            <div className="coffee-gradient p-3 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                  placeholder="Enter current password"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4423] hover:text-[#4A2F19]"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                  placeholder="Enter new password"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4423] hover:text-[#4A2F19]"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#6B4423] mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                  placeholder="Confirm new password"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4423] hover:text-[#4A2F19]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={changingPassword}
                className="coffee-gradient text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all duration-200 shadow-coffee-md hover:shadow-coffee-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
