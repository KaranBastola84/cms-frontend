import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-b from-amber-900 to-amber-950 text-amber-100 mt-auto border-t border-amber-700/30">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">☕</span>
            <div>
              <h3 className="text-xl font-bold text-amber-50 m-0">
                Coffee School
              </h3>
              <span className="text-amber-400 text-xs">Management System</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-amber-300/90">
            Empowering coffee education through innovative technology and
            passionate teaching.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold text-amber-50 mb-1 flex items-center gap-2">
            <span className="text-lg">🔗</span> Quick Links
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <li>
              <Link
                to="/"
                className="text-amber-200/90 no-underline text-sm hover:text-amber-100 hover:pl-2 transition-all duration-200 inline-block"
              >
                → Home
              </Link>
            </li>
            <li>
              <Link
                to="/inquiry"
                className="text-amber-200/90 no-underline text-sm hover:text-amber-100 hover:pl-2 transition-all duration-200 inline-block"
              >
                → Inquiry Form
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold text-amber-50 mb-1 flex items-center gap-2">
            <span className="text-lg">📞</span> Contact
          </h4>
          <div className="space-y-2">
            <p className="text-sm text-amber-200/90 my-0 flex items-center gap-2">
              <span className="text-amber-400">✉</span> info@coffeeschool.com
            </p>
            <p className="text-sm text-amber-200/90 my-0 flex items-center gap-2">
              <span className="text-amber-400">☎</span> +977 9826320515
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-950/80 py-4 border-t border-amber-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-amber-400/80 m-0">
            &copy; {currentYear} Coffee School Management System. Crafted with
            ☕ & 💻
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
