import React from "react";
import { Link } from "react-router-dom";
import { Coffee, Link2, Mail, Phone, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="caramel-cream-gradient mt-auto border-t border-[#C8A27B]/30 shadow-coffee-lg">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="coffee-gradient p-2 rounded-xl shadow-sm">
              <Coffee className="w-5 h-5 text-[#EFE7D3]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Coffee School
              </h3>
              <span className="text-[#6B4423] text-xs font-semibold">
                Management System
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#4A2F19] font-medium">
            Empowering coffee education through innovative technology and
            passionate teaching.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Quick Links
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <li>
              <Link
                to="/"
                className="text-[#4A2F19] no-underline text-sm hover:text-[#1A1A1A] hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B4423]"></span>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/inquiry"
                className="text-[#4A2F19] no-underline text-sm hover:text-[#1A1A1A] hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B4423]"></span>
                Inquiry Form
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact
          </h4>
          <div className="space-y-2">
            <p className="text-sm text-[#4A2F19] my-0 flex items-center gap-2 font-semibold">
              <Mail className="w-4 h-4 text-[#6B4423]" />
              info@coffeeschool.com
            </p>
            <p className="text-sm text-[#4A2F19] my-0 flex items-center gap-2 font-semibold">
              <Phone className="w-4 h-4 text-[#6B4423]" />
              +977 9826320515
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
