import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Coffee, FileText, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    logout(); // handles redirection to /login
  };

  return (
    <header className="bg-linear-to-r from-amber-800 via-amber-700 to-amber-800 py-4 shadow-md sticky top-0 z-50 border-b border-amber-900/20">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="no-underline flex items-center gap-3 group">
          <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors duration-200">
            <Coffee className="w-6 h-6 text-amber-100" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-xl font-bold m-0 tracking-tight">
              Coffee School
            </h1>
            <span className="text-amber-200 text-xs font-medium tracking-wide">
              Management System
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/inquiry"
            className="text-white no-underline text-sm font-medium hover:text-amber-100 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Inquiry</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">
                    {user.username}
                  </span>
                  <span className="text-amber-200 text-xs">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium no-underline shadow-sm hover:shadow-md flex items-center gap-2 backdrop-blur-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
