import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F0F0F] pt-32 pb-12 flex-shrink-0 border-t border-[#ffffff05]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 no-underline mb-8 group">
              <div className="text-[#C6A36A]">
                <Coffee className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-heading font-bold text-white tracking-widest uppercase">Brewista</span>
                <span className="text-[#C6A36A] text-[10px] tracking-[0.3em] uppercase">Academy</span>
              </div>
            </Link>
            <p className="text-[#E0E0E0] text-sm leading-relaxed mb-6 font-light">
            Elevating the global standard in specialty coffee education. Train with world champions in state-of-the-art facilities.
            </p>
            <div className="flex gap-5">
              <a href="#" className="w-10 h-10 rounded-full border border-[#ffffff15] flex items-center justify-center text-[#B3B3B3] hover:text-[#C6A36A] hover:border-[#C6A36A] transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#ffffff15] flex items-center justify-center text-[#B3B3B3] hover:text-[#C6A36A] hover:border-[#C6A36A] transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#ffffff15] flex items-center justify-center text-[#B3B3B3] hover:text-[#C6A36A] hover:border-[#C6A36A] transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-bold mb-8 text-sm tracking-widest uppercase">Programs</h3>
            <ul className="space-y-4 p-0 list-none m-0">
              <li>
                <Link to="/products" className="text-[#CCCCCC] hover:text-[#C6A36A] transition-colors text-sm uppercase tracking-wider no-underline flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#C6A36A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Barista Foundation
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#CCCCCC] hover:text-[#C6A36A] transition-colors text-sm uppercase tracking-wider no-underline flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#C6A36A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Advanced Latte Art
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#CCCCCC] hover:text-[#C6A36A] transition-colors text-sm uppercase tracking-wider no-underline flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#C6A36A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Roasting Professional
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#CCCCCC] hover:text-[#C6A36A] transition-colors text-sm uppercase tracking-wider no-underline flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#C6A36A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Sensory Analysis
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#CCCCCC] hover:text-[#C6A36A] transition-colors text-sm uppercase tracking-wider no-underline flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-[#C6A36A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Cafe Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-heading font-bold mb-8 text-sm tracking-widest uppercase">Contact</h3>
            <ul className="space-y-4 p-0 list-none m-0">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C6A36A] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-[#CCCCCC] text-sm uppercase tracking-wider leading-relaxed">
                  124 Specialty Ave.<br />
                  Portland, OR 97209
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C6A36A] shrink-0" strokeWidth={1.5} />
                <span className="text-[#CCCCCC] text-sm tracking-wider">+1 (555) 019-8234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C6A36A] shrink-0" strokeWidth={1.5} />
                <span className="text-[#CCCCCC] text-sm tracking-wider hover:text-[#C6A36A] transition-colors cursor-pointer">admissions@brewista.edu</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-heading font-bold mb-8 text-sm tracking-widest uppercase">Newsletter</h3>
            <p className="text-[#E0E0E0] text-sm leading-relaxed font-light mb-6">
              Subscribe to receive updates on global symposiums, masterclasses, and alumni achievements.
            </p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-[#1A1A1A] border-b border-[#ffffff30] text-white px-0 py-3 text-sm focus:outline-none focus:border-[#C6A36A] transition-colors"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[#C6A36A] hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-[#ffffff10] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#CCCCCC] text-xs uppercase tracking-widest text-center md:text-left">
            &copy; {new Date().getFullYear()} Brewista Academy. All rights reserved.
          </p>
          <div className="flex gap-6 text-[#CCCCCC] text-xs uppercase tracking-widest">
            <Link to="/" className="hover:text-[#C6A36A] transition-colors no-underline">Privacy Policy</Link>
            <Link to="/" className="hover:text-[#C6A36A] transition-colors no-underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
