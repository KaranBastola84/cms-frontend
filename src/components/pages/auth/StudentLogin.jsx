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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 cream-gradient">
      <div className="bg-white rounded-2xl shadow-coffee-lg p-8 w-full max-w-md border border-[#C8A27B]/30 fade-in hover-lift">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 coffee-gradient rounded-2xl mb-4 shadow-coffee-md">
            <Coffee className="w-9 h-9 text-[#EFE7D3]" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Student Login
          </h2>
          <p className="text-sm text-[#4A2F19] font-medium">
            Sign in with your enrolled student account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-[#4A2F19]" />
              Student Email
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
              placeholder="Enter your student email"
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.email}
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
              "Sign In as Student"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-[#4A2F19] hover:text-[#6B4423] inline-flex items-center justify-center gap-2"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to staff/admin/trainer login
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
