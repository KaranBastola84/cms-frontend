import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-amber-900 text-amber-100 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☕</span>
            <h3 className="text-2xl font-bold text-amber-50 m-0">CMS</h3>
          </div>
          <p className="text-sm leading-relaxed text-amber-200">
            College Management System - Empowering education through technology.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-lg font-semibold text-amber-50 mb-2">
            Quick Links
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <li>
              <Link
                to="/"
                className="text-amber-200 no-underline text-sm hover:text-amber-300 transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/inquiry"
                className="text-amber-200 no-underline text-sm hover:text-amber-300 transition-colors duration-300"
              >
                Inquiry
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-lg font-semibold text-amber-50 mb-2">Contact</h4>
          <p className="text-sm text-amber-200 my-1">Email: info@cms.com</p>
          <p className="text-sm text-amber-200 my-1">Phone: +1 234 567 890</p>
        </div>
      </div>

      <div className="bg-amber-950 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-sm text-amber-300 m-0">
            &copy; {currentYear} CMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
