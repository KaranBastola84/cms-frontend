import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Coffee, FileText, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    logout(); // handles redirection to /login
  };

  return (
    <header className="latte-gradient py-4 shadow-coffee-md sticky top-0 z-50 border-b border-[#C8A27B]/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="no-underline flex items-center gap-3 group">
          <div className="coffee-gradient p-2.5 rounded-xl group-hover:opacity-90 transition-all duration-200 shadow-sm">
            <Coffee className="w-6 h-6 text-[#EFE7D3]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#1A1A1A] text-xl font-bold m-0 tracking-tight">
              Brewista Coffee School
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/inquiry"
            className="text-[#4A2F19] no-underline text-sm font-semibold hover:text-[#1A1A1A] transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Inquiry</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3 bg-white/60 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-[#C8A27B]/40 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="coffee-gradient p-1.5 rounded-full shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#1A1A1A] text-sm font-bold">
                    {user.username}
                  </span>
                  <span className="text-[#6B4423] text-xs font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md flex items-center gap-1.5 hover:scale-105"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#4A2F19] hover:bg-[#6B4423] text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold no-underline shadow-coffee-md hover:shadow-coffee-lg flex items-center gap-2 hover:scale-105"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span className="text-white">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
