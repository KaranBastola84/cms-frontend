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
    <header className="bg-linear-to-r from-amber-900 via-amber-800 to-amber-900 backdrop-blur-sm py-3.5 shadow-lg sticky top-0 z-50 border-b border-amber-700/30">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="no-underline flex items-center gap-2.5 group">
          <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
            ☕
          </div>
          <div className="flex flex-col">
            <h1 className="text-amber-50 text-2xl font-bold m-0 tracking-tight">
              Coffee School
            </h1>
            <span className="text-amber-300 text-xs tracking-wider">
              Management System
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/inquiry"
            className="text-amber-100 no-underline text-sm font-medium hover:text-amber-200 transition-all duration-200 px-3 py-1.5 rounded-md hover:bg-amber-800/40"
          >
            📋 Inquiry
          </Link>

          {user ? (
            <div className="flex items-center gap-3 bg-amber-800/30 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-amber-50 text-xs font-medium">
                  {user.username}
                </span>
                <span className="text-amber-300 text-[10px]">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600/90 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium no-underline shadow-sm hover:shadow-md"
            >
              🔐 Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
