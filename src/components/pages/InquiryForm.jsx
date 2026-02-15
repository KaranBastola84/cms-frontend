import React, { useState } from "react";
import inquiryService from "../../services/inquiryService";

const InquiryForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    courseInterest: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [validationErrors, setValidationErrors] = useState({});

  const courses = [
    "Barista Basics",
    "Latte Art Mastery",
    "Coffee Roasting",
    "Cafe Management",
    "Espresso Techniques",
    "Coffee Tasting & Cupping",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    setValidationErrors({});

    // Frontend validation
    const errors = {};
    if (formData.message.length < 10) {
      errors.message = "Message must be at least 10 characters long.";
    }
    if (formData.message.length > 1000) {
      errors.message = "Message must not exceed 1000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    // Call service and handle response
    const result = await inquiryService.submitInquiry(formData);

    if (result.success) {
      setStatus({
        type: "success",
        message:
          "Thank you! Your inquiry has been submitted successfully. We will contact you soon.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        courseInterest: "",
        message: "",
      });
    } else {
      // Handle validation errors from backend
      if (result.errors) {
        const backendErrors = {};
        Object.keys(result.errors).forEach((key) => {
          const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
          backendErrors[fieldName] = result.errors[key][0];
        });
        setValidationErrors(backendErrors);
        setStatus({
          type: "error",
          message: "Please fix the validation errors below.",
        });
      } else {
        setStatus({
          type: "error",
          message: result.message,
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50/80 via-orange-50/60 to-amber-100/80 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-orange-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-linear-to-br from-amber-100 to-amber-200 rounded-3xl mb-4 shadow-lg">
              <span className="text-6xl">☕</span>
            </div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">
              Course Inquiry
            </h1>
            <p className="text-amber-700/90 text-base max-w-xl mx-auto">
              Interested in mastering the art of coffee? Fill out the form below
              and our team will get back to you within 24 hours!
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-amber-200/50"
          >
            {/* Status Message */}
            {status.message && (
              <div
                className={`mb-6 p-4 rounded-xl shadow-md border-l-4 ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800 border-green-500"
                    : "bg-red-50 text-red-800 border-red-500"
                }`}
              >
                <p className="m-0 text-sm flex items-center gap-2">
                  <span>{status.type === "success" ? "✅" : "⚠️"}</span>
                  {status.message}
                </p>
              </div>
            )}

            {/* Name */}
            <div className="mb-5">
              <label
                className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1.5"
                htmlFor="fullName"
              >
                👤 Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-amber-300/60 bg-amber-50/30 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-400/30 focus:outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label
                  className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1.5"
                  htmlFor="email"
                >
                  ✉️ Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-amber-300/60 bg-amber-50/30 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-400/30 focus:outline-none transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1.5"
                  htmlFor="phoneNumber"
                >
                  📞 Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-amber-300/60 bg-amber-50/30 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-400/30 focus:outline-none transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Course Selection */}
            <div className="mb-5">
              <label
                className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1.5"
                htmlFor="courseInterest"
              >
                ☕ Course of Interest <span className="text-red-600">*</span>
              </label>
              <select
                id="courseInterest"
                name="courseInterest"
                value={formData.courseInterest}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-amber-300/60 bg-amber-50/30 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-400/30 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">Choose a course...</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label
                className="block text-xs font-bold text-amber-900 uppercase tracking-wide mb-1.5"
                htmlFor="message"
              >
                💬 Your Message <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                minLength={10}
                maxLength={1000}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                  validationErrors.message
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50/30"
                    : "border-amber-300/60 focus:border-amber-600 focus:ring-amber-400/30 bg-amber-50/30"
                }`}
                placeholder="Tell us about your coffee journey and what you hope to learn... (min. 10 characters)"
              ></textarea>
              <div className="flex justify-between items-center mt-1">
                <div>
                  {validationErrors.message && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.message}
                    </p>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    formData.message.length < 10
                      ? "text-red-500"
                      : formData.message.length > 1000
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {formData.message.length} / 1000
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-linear-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                {loading ? "⏳ Sending..." : "📨 Submit Inquiry"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    fullName: "",
                    email: "",
                    phoneNumber: "",
                    courseInterest: "",
                    message: "",
                  })
                }
                className="px-8 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-sm uppercase tracking-wide transition-all border-2 border-amber-300/60 hover:border-amber-400"
              >
                🔄 Reset
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-linear-to-r from-amber-100/60 to-orange-100/60 rounded-2xl border border-amber-300/40 text-center backdrop-blur-sm">
            <p className="text-sm text-amber-900 mb-2 font-medium">
              📞 Prefer to talk? Call us directly!
            </p>
            <a
              href="tel:+9779826320515"
              className="inline-block text-xl font-bold text-amber-900 hover:text-amber-700 transition-colors no-underline"
            >
              +977 9826320515
            </a>
            <p className="text-xs text-amber-700 mt-2">
              Available Mon-Fri, 9 AM - 6 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
