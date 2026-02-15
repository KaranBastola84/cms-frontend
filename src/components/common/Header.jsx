import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-amber-900 py-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <div>
          <Link to="/" className="no-underline flex items-center gap-2">
            <span className="text-3xl">☕</span>
            <h1 className="text-amber-50 text-3xl font-bold m-0">CMS</h1>
          </Link>
        </div>

        <nav className="flex items-center gap-8">
          <Link
            to="/inquiry"
            className="text-amber-100 no-underline text-base font-medium hover:text-amber-300 transition-colors duration-300"
          >
            Inquiry
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-amber-100 text-sm">
                Welcome, {user.username} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-300 text-sm font-medium shadow-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded transition-colors duration-300 text-sm font-medium no-underline shadow-md"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
