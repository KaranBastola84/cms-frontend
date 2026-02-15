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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8 bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="bg-white rounded-lg shadow-xl p-10 w-full max-w-md border-2 border-amber-200">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-4xl">☕</span>
            <h2 className="text-3xl font-bold text-amber-900 m-0">
              Login to CMS
            </h2>
          </div>
          <p className="text-base text-amber-800">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-3 py-3">
              <p className="text-red-600 text-sm m-0">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-amber-900"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="px-3 py-3 text-base border-2 border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-600 transition-all disabled:bg-amber-50 disabled:cursor-not-allowed"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-amber-900"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-3 py-3 text-base border-2 border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-600 transition-all disabled:bg-amber-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`px-4 py-3.5 text-base font-semibold border-none rounded cursor-pointer transition-colors mt-2 shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-amber-700 hover:bg-amber-800 text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
