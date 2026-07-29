import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Coffee,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
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
  const { studentLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const email = String(formData.email || "").trim();

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid email address";
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

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors", { duration: 4000 });
      setLoading(false);
      return;
    }

    try {
      const result = await studentLogin(formData.email, formData.password);

      if (result.success) {
        toast.success(
          `Welcome back, ${result.user.name || result.user.email || "Student"}!`,
        );
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Invalid email or password", {
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
    <div ref={containerRef} className="min-h-[calc(100vh-68px)] flex items-center justify-center p-6 bg-[var(--bg-page)] mt-[68px]">
      <div className="auth-card p-10 w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl">
        <div className="text-center mb-10 auth-element">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--brand-secondary)] rounded-xl mb-6 shadow-md">
            <Coffee className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
            Student Login
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Sign in to your Brewista portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 auth-element">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wide"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
              Student Email
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
              placeholder="Enter your student email"
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 auth-element">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wide"
            >
              <Lock className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
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
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="auth-element pt-2">
            <button
              type="submit"
              className={`btn-green w-full ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Campus"
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="auth-element text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] uppercase tracking-wide inline-flex items-center justify-center gap-2 mt-2 transition-colors font-medium"
            disabled={loading}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Faculty Portal
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
