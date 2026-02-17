import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Coffee,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import staffManagementService from "../../../services/staffManagementService";

const StaffVerification = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // OTP validation
    if (!formData.otp) {
      errors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = "OTP must be exactly 6 digits";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    // Frontend validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors", {
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      await staffManagementService.verifyOTP({
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      });

      toast.success(
        "Verification successful! Please wait for admin to activate your account.",
        {
          duration: 6000,
          icon: "🎉",
        },
      );

      // Navigate to login page after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Verification failed. Please try again.", {
        duration: 5000,
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          fontWeight: "600",
        },
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 cream-gradient">
      <div className="bg-white rounded-2xl shadow-coffee-lg p-8 w-full max-w-md border border-[#C8A27B]/30 fade-in hover-lift">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 coffee-gradient rounded-2xl mb-4 shadow-coffee-md">
            <ShieldCheck className="w-9 h-9 text-[#EFE7D3]" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Staff Verification
          </h2>
          <p className="text-sm text-[#4A2F19] font-medium">
            Verify your OTP and set your password
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your email for the 6-digit OTP</li>
                <li>OTP is valid for 15 minutes</li>
                <li>After verification, wait for admin activation</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-[#4A2F19]" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`coffee-input ${
                validationErrors.email
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : ""
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* OTP Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="otp"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-[#4A2F19]" />
              6-Digit OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              maxLength={6}
              pattern="\d{6}"
              className={`coffee-input ${
                validationErrors.otp
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : ""
              } disabled:bg-gray-100 disabled:cursor-not-allowed tracking-widest text-center text-xl font-semibold`}
              placeholder="000000"
              disabled={loading}
            />
            {validationErrors.otp && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.otp}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#4A2F19]" />
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`coffee-input ${
                validationErrors.password
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : ""
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Enter your password (min 6 characters)"
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-[#4A2F19]" />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`coffee-input ${
                validationErrors.confirmPassword
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : ""
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="coffee-button group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-coffee-md"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Verify & Set Password
                </>
              )}
            </span>
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-[#C8A27B]/30 text-center">
          <p className="text-sm text-[#6B4423]">
            Already verified?{" "}
            <a
              href="/login"
              className="text-[#4A2F19] font-semibold hover:text-[#6B4423] transition-colors"
            >
              Sign in here
            </a>
          </p>
          <p className="text-xs text-[#6B4423] mt-3">
            Didn't receive OTP? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffVerification;
