import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Coffee,
  FileText,
  LogIn,
  LogOut,
  User,
  ShoppingBag,
  ShoppingCart,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const Header = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll for sticky luxury effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    logout();
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[var(--bg-sidebar)] bg-opacity-95 backdrop-blur-md border-b border-[var(--border-subtle)] py-4" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="no-underline flex items-center gap-3 group">
          <div className="text-[var(--brand-accent)] transition-transform duration-300 group-hover:scale-110">
            <Coffee className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-2xl font-heading font-bold m-0 tracking-widest uppercase">
              Brewista
            </h1>
            <span className="text-[var(--brand-accent)] text-[10px] tracking-[0.3em] uppercase mt-0.5">
              Academy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/products"
            className="text-[var(--text-secondary)] hover:text-[var(--brand-accent)] transition-colors font-medium flex items-center gap-2 text-sm uppercase tracking-widest no-underline"
          >
            <span>Programs</span>
          </Link>

          <Link
            to="/inquiry"
            className="text-[var(--text-secondary)] hover:text-[var(--brand-accent)] transition-colors font-medium flex items-center gap-2 text-sm uppercase tracking-widest no-underline"
          >
            <span>Admissions</span>
          </Link>

          <div className="h-4 w-px bg-[#ffffff15]"></div>

          <Link
            to="/checkout"
            className="text-[var(--text-secondary)] hover:text-white transition-colors relative"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#C6A36A] text-[#0F0F0F] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 border-l border-[var(--border-subtle)] pl-6">
                <div className="flex flex-col text-right">
                  <span className="text-white text-sm font-medium tracking-wide">
                    {user.username}
                  </span>
                  <span className="text-[var(--text-secondary)] text-[10px] tracking-wider uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#C6A36A]/50 flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--brand-accent)]" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[var(--text-secondary)] hover:text-[var(--brand-accent)] transition-colors bg-transparent border-none cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-gold-secondary px-6 py-2.5 ml-2"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white bg-transparent border-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] shadow-2xl py-6 px-6 flex flex-col gap-6">
           <Link to="/products" className="text-white text-lg tracking-widest uppercase no-underline" onClick={() => setMobileMenuOpen(false)}>Programs</Link>
           <Link to="/inquiry" className="text-white text-lg tracking-widest uppercase no-underline" onClick={() => setMobileMenuOpen(false)}>Admissions</Link>
           <Link to="/checkout" className="text-white text-lg tracking-widest uppercase no-underline flex justify-between" onClick={() => setMobileMenuOpen(false)}>
              Cart <span className="text-[var(--brand-accent)]">({cartItemCount})</span>
           </Link>
           
           <div className="h-px w-full bg-[#ffffff10]"></div>

           {user ? (
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--brand-accent)]" />
                  <span className="text-white">{user.username}</span>
                  <span className="text-[var(--text-secondary)] text-sm">- {user.role}</span>
                </div>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-[var(--brand-accent)] bg-transparent border-none text-lg tracking-widest uppercase">
                  Logout
                </button>
             </div>
           ) : (
             <Link to="/login" className="btn-gold-primary text-center w-full" onClick={() => setMobileMenuOpen(false)}>
               Sign In
             </Link>
           )}
        </div>
      )}
    </header>
  );
};

export default Header;
