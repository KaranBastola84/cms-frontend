import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Coffee,
  User,
  Lock,
  AlertCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();

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

    if (!formData.username || formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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
      const result = await login(formData.username, formData.password);

      if (result.success) {
        toast.success(
          `Welcome back, ${result.user.name || result.user.username || result.user.email || "User"}!`,
        );

        // Navigate to role-specific dashboard
        const userRole = result.user.role;

        switch (userRole) {
          case "Admin":
            navigate("/admin/dashboard", { replace: true });
            break;
          case "Staff":
            navigate("/staff/dashboard", { replace: true });
            break;
          case "Trainer":
            navigate("/trainer/dashboard", { replace: true });
            break;
          case "Student":
            navigate("/student/dashboard", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }
    } catch (err) {
      // Show error with longer duration for better visibility
      toast.error(err.message || "Invalid username or password", {
        duration: 5000, // 5 seconds
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
            <Coffee className="w-10 h-10 text-[#C6A36A]" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-heading font-normal text-white mb-3 uppercase tracking-widest">
            Welcome Back
          </h2>
          <p className="text-sm text-[#E0E0E0] font-light tracking-wide">
            Sign in to Coffee School Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="username"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <User className="w-4 h-4 text-[#C6A36A]" />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`luxury-input ${
                validationErrors.username
                  ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                  : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter your username"
              disabled={loading}
            />
            {validationErrors.username && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.username}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label
              htmlFor="password"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <Lock className="w-4 h-4 text-[#C6A36A]" />
              Password
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
              placeholder="Enter your password"
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`btn-gold-primary text-sm mt-4 flex items-center justify-center gap-2 ${
              loading ? "opacity-60 cursor-not-allowed shadow-none" : "shadow-[0_4px_20px_rgba(198,163,106,0.15)]"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                Authenticating...
              </>
            ) : (
              "Sign In to Portal"
            )}
          </button>

          <a
            href="/student-login"
            className="text-xs text-[#808080] hover:text-[#C6A36A] text-center uppercase tracking-widest transition-colors mt-2"
          >
            Student? Access Student Portal
          </a>
        </form>

        {/* Staff and Trainer Verification Links */}
        <div className="mt-8 pt-8 border-t border-[#ffffff10]">
          <p className="text-xs text-[#CCCCCC] mb-4 text-center font-heading uppercase tracking-widest">
            First Time Authentication?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Staff Verification */}
            <a
              href="/staff-verification"
              className="flex flex-col items-center gap-3 p-4 bg-[#0F0F0F] hover:bg-[#222222] border border-[#ffffff15] hover:border-[#C6A36A]/50 rounded-xl transition-all duration-300 group"
            >
              <Coffee className="w-5 h-5 text-[#808080] group-hover:text-[#C6A36A] transition-colors" />
              <span className="text-[10px] font-bold text-[#E0E0E0] uppercase tracking-wider text-center">
                Staff<br/>Verify
              </span>
            </a>

            {/* Trainer Verification */}
            <a
              href="/trainer-verification"
              className="flex flex-col items-center gap-3 p-4 bg-[#0F0F0F] hover:bg-[#222222] border border-[#ffffff15] hover:border-[#C6A36A]/50 rounded-xl transition-all duration-300 group"
            >
              <GraduationCap className="w-5 h-5 text-[#808080] group-hover:text-[#C6A36A] transition-colors" />
              <span className="text-[10px] font-bold text-[#E0E0E0] uppercase tracking-wider text-center">
                Trainer<br/>Verify
              </span>
            </a>
          </div>

          <p className="text-[10px] text-[#808080] mt-5 text-center uppercase tracking-widest">
            Check your email for the authentication code
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
