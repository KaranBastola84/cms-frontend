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
          case "EnrolledStudent":
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 cream-gradient">
      <div className="bg-white rounded-2xl shadow-coffee-lg p-8 w-full max-w-md border border-[#C8A27B]/30 fade-in hover-lift">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 coffee-gradient rounded-2xl mb-4 shadow-coffee-md">
            <Coffee className="w-9 h-9 text-[#EFE7D3]" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-[#4A2F19] font-medium">
            Sign in to Coffee School Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#4A2F19]" />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`coffee-input ${
                validationErrors.username
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : ""
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
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

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#4A2F19]" />
              Password
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
            className={`btn-coffee-primary text-sm mt-2 flex items-center justify-center gap-2 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <a
            href="/student-login"
            className="text-sm text-[#4A2F19] hover:text-[#6B4423] text-center"
          >
            Student? Use dedicated student login
          </a>
        </form>

        {/* Staff and Trainer Verification Links */}
        <div className="mt-6 pt-6 border-t border-[#C8A27B]/30">
          <p className="text-sm text-[#6B4423] mb-3 text-center font-semibold">
            New Account?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Staff Verification */}
            <a
              href="/staff-verification"
              className="flex flex-col items-center gap-2 p-3 bg-[#F8F4EE] hover:bg-[#EFE7D3] border-2 border-[#C8A27B]/30 hover:border-[#4A2F19] rounded-xl transition-all duration-200 group"
            >
              <Coffee className="w-5 h-5 text-[#4A2F19] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-[#4A2F19]">
                Staff Verification
              </span>
            </a>

            {/* Trainer Verification */}
            <a
              href="/trainer-verification"
              className="flex flex-col items-center gap-2 p-3 bg-[#F8F4EE] hover:bg-[#EFE7D3] border-2 border-[#C8A27B]/30 hover:border-[#4A2F19] rounded-xl transition-all duration-200 group"
            >
              <GraduationCap className="w-5 h-5 text-[#4A2F19] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-[#4A2F19]">
                Trainer Verification
              </span>
            </a>
          </div>

          <p className="text-xs text-[#6B4423] mt-3 text-center">
            Check your email for the OTP code
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
