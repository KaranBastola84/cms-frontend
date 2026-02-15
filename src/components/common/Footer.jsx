import React from "react";
import { Link } from "react-router-dom";
import { Coffee, Link2, Mail, Phone, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-b from-amber-900 to-amber-950 text-amber-100 mt-auto border-t border-amber-800/50">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-white/10 p-2 rounded-lg">
              <Coffee className="w-5 h-5 text-amber-100" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white m-0">
                Coffee School
              </h3>
              <span className="text-amber-300 text-xs font-medium">
                Management System
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-amber-200/80">
            Empowering coffee education through innovative technology and
            passionate teaching.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Quick Links
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <li>
              <Link
                to="/"
                className="text-amber-200/90 no-underline text-sm hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/inquiry"
                className="text-amber-200/90 no-underline text-sm hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Inquiry Form
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact
          </h4>
          <div className="space-y-2">
            <p className="text-sm text-amber-200/90 my-0 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              info@coffeeschool.com
            </p>
            <p className="text-sm text-amber-200/90 my-0 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              +977 9826320515
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-950/50 py-4 border-t border-amber-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-amber-300/70 m-0 flex items-center justify-center gap-1">
            &copy; {currentYear} Coffee School Management System. Made with{" "}
            <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by the team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
