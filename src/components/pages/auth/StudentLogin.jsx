import React, { useState } from "react";
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 bg-[#0F0F0F]">
      <div className="luxury-card p-10 w-full max-w-md bg-[#1A1A1A] border-[#ffffff15] fade-in transform transition-transform duration-500 hover:scale-[1.01]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-[#0F0F0F] rounded-2xl mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#ffffff10]">
            <Coffee className="w-10 h-10 text-[#C6A36A]" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-heading font-normal text-white mb-3 uppercase tracking-widest">
            Student Login
          </h2>
          <p className="text-sm text-[#E0E0E0] font-light tracking-wide">
            Sign in with your enrolled student account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="email"
              className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest"
            >
              <Mail className="w-4 h-4 text-[#C6A36A]" />
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
              <p className="text-[#C62828] text-xs mt-1 flex items-center gap-1 font-medium">
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
              "Sign In to Campus"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs text-[#808080] hover:text-[#C6A36A] uppercase tracking-widest inline-flex items-center justify-center gap-2 mt-2 transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-3 h-3" />
            Return to Faculty Portal
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
