import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

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
    setLoading(true);
    setError("");

    try {
      await login(formData.username, formData.password);
      // Redirect to home page on success
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 bg-linear-to-br from-amber-50/80 via-orange-50/60 to-amber-100/80 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-amber-200/50 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-linear-to-br from-amber-100 to-amber-200 rounded-2xl mb-3 shadow-sm">
            <span className="text-5xl">☕</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-900 mb-1">
            Welcome Back!
          </h2>
          <p className="text-sm text-amber-700/80">
            Sign in to Coffee School Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 rounded-r-lg px-4 py-3 shadow-sm">
              <p className="text-red-700 text-sm m-0 flex items-center gap-2">
                <span>⚠️</span> {error}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-amber-900 uppercase tracking-wide"
            >
              👤 Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="px-4 py-2.5 text-sm border-2 border-amber-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-600 transition-all disabled:bg-amber-50/50 disabled:cursor-not-allowed bg-amber-50/30"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-amber-900 uppercase tracking-wide"
            >
              🔒 Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-4 py-2.5 text-sm border-2 border-amber-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-600 transition-all disabled:bg-amber-50/50 disabled:cursor-not-allowed bg-amber-50/30"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`px-4 py-3 text-sm font-bold border-none rounded-lg cursor-pointer transition-all mt-2 shadow-md uppercase tracking-wide ${
              loading
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : "bg-linear-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white hover:shadow-lg transform hover:scale-[1.02]"
            }`}
            disabled={loading}
          >
            {loading ? "⏳ Authenticating..." : "🔓 Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
