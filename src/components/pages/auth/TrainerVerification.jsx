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
  GraduationCap,
} from "lucide-react";
import trainerManagementService from "../../../services/trainerManagementService";

const TrainerVerification = () => {
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
      await trainerManagementService.verifyOTP({
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 bg-[#0F0F0F]">
      <div className="luxury-card p-10 w-full max-w-md bg-[#1A1A1A] border-[#ffffff15] fade-in transform transition-transform duration-500 hover:scale-[1.01]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-[#0F0F0F] rounded-2xl mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#ffffff10]">
            <GraduationCap
              className="w-10 h-10 text-[#C6A36A]"
              strokeWidth={2}
            />
          </div>
          <h2 className="text-3xl font-heading font-normal text-white mb-3 uppercase tracking-widest">
            Trainer Verification
          </h2>
          <p className="text-sm text-[#E0E0E0] font-light tracking-wide">
            Verify your OTP and set your password
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-[#0F0F0F] border border-[#ffffff10] rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#C6A36A] shrink-0 mt-0.5" />
            <div className="text-sm text-[#CCCCCC]">
              <p className="font-heading uppercase tracking-widest text-[#E0E0E0] mb-2 text-xs">Important:</p>
              <ul className="list-disc list-inside space-y-1 font-light text-[13px] leading-relaxed">
                <li>Check your email for the 6-digit verification code</li>
                <li>Code remains valid for 15 minutes</li>
                <li>Following approval, pending admin activation</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Field */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="email"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <Mail className="w-4 h-4 text-[#C6A36A]" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`luxury-input ${
                validationErrors.email
                  ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                  : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* OTP Field */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="otp"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <KeyRound className="w-4 h-4 text-[#C6A36A]" />
              6-Digit Code
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
              className={`luxury-input text-center text-2xl tracking-[0.5em] font-heading ${
                validationErrors.otp
                  ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                  : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="000000"
              disabled={loading}
            />
            {validationErrors.otp && (
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.otp}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="password"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <Lock className="w-4 h-4 text-[#C6A36A]" />
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`luxury-input ${
                validationErrors.password
                  ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                  : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter your password (min 6 characters)"
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <CheckCircle className="w-4 h-4 text-[#C6A36A]" />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`luxury-input ${
                validationErrors.confirmPassword
                  ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                  : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`btn-gold-primary text-sm mt-4 flex items-center justify-center gap-2 ${
              loading ? "opacity-60 cursor-not-allowed shadow-none" : "shadow-[0_4px_20px_rgba(198,163,106,0.15)]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                Verifying...
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                Verify & Set Password
              </>
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-[#ffffff10] text-center">
          <p className="text-[10px] text-[#808080] uppercase tracking-widest mb-3">
            Already authenticated?{" "}
            <a
              href="/login"
              className="text-[#E0E0E0] font-bold hover:text-[#C6A36A] transition-colors ml-1"
            >
              Sign In
            </a>
          </p>
          <p className="text-[10px] text-[#808080] uppercase tracking-widest">
            Missing access code? Contact your supervisor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainerVerification;
