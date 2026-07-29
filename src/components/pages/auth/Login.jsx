import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
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
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".auth-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        ".auth-element",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
    <div ref={containerRef} className="min-h-[calc(100vh-68px)] flex items-center justify-center p-6 bg-[var(--bg-page)] mt-[68px]">
      <div className="auth-card p-10 w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl">
        <div className="text-center mb-10 auth-element">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--brand-primary)] rounded-xl mb-6 shadow-md">
            <Coffee className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
            Welcome Back
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Sign in to your Brewista portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 auth-element">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wide"
            >
              <User className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
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

          <div className="flex flex-col gap-2 auth-element">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wide"
            >
              <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
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

          <div className="auth-element pt-2">
            <button
              type="submit"
              className={`btn-primary w-full ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <a
            href="/student-login"
            className="auth-element text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] text-center transition-colors mt-2 font-medium"
          >
            Student? Access Student Portal
          </a>
        </form>

        {/* Staff and Trainer Verification Links */}
        <div className="mt-8 pt-8 border-t border-[var(--border-subtle)] auth-element">
          <p className="text-xs text-[var(--text-secondary)] mb-4 text-center font-heading uppercase tracking-wider">
            First Time Authentication?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Staff Verification */}
            <a
              href="/staff-verification"
              className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-surface-alt)] hover:bg-[var(--brand-primary-bg)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-xl transition-all duration-200 group"
            >
              <Coffee className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] uppercase tracking-wider text-center transition-colors">
                Staff Verify
              </span>
            </a>

            {/* Trainer Verification */}
            <a
              href="/trainer-verification"
              className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-surface-alt)] hover:bg-[var(--brand-primary-bg)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-xl transition-all duration-200 group"
            >
              <GraduationCap className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] uppercase tracking-wider text-center transition-colors">
                Trainer Verify
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
