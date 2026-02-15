import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Coffee, User, Lock, AlertCircle, Loader2 } from "lucide-react";
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
      toast.error("Please fix the validation errors");
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        toast.success(`Welcome back, ${result.user.username}!`);

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
      toast.error(err.message || "Invalid username or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl mb-4 shadow-sm">
            <Coffee className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to Coffee School Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.username
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : "border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              }`}
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
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.password
                  ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                  : "border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              }`}
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
            className={`px-4 py-3 text-sm font-semibold border-none rounded-lg cursor-pointer transition-all mt-2 shadow-sm flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : "bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white hover:shadow-md"
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
        </form>
      </div>
    </div>
  );
};

export default Login;
