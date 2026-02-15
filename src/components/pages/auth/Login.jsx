import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login...");
      const result = await login(formData.username, formData.password);
      console.log("Login result:", result);

      if (result.success) {
        // Navigate to role-specific dashboard
        const userRole = result.user.role;
        console.log("User role:", userRole);

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
      console.error("Login error:", err);
      setError(err.message || "Invalid username or password");
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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm m-0">{error}</p>
            </div>
          )}

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
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your username"
              disabled={loading}
            />
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
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your password"
              disabled={loading}
            />
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
