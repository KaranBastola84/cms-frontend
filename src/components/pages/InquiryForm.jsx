import React, { useState } from "react";
import {
  Coffee,
  User,
  Mail,
  Phone,
  BookOpen,
  MessageSquare,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
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
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 py-12">
      {/* Form Section */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl mb-4 shadow-md">
              <Coffee className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Course Inquiry
            </h1>
            <p className="text-gray-700 text-base max-w-xl mx-auto">
              Interested in mastering the art of coffee? Fill out the form below
              and our team will get back to you within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            {/* Status Message */}
            {status.message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <p className="m-0 text-sm">{status.message}</p>
              </div>
            )}

            {/* Name */}
            <div className="mb-5">
              <label
                className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                htmlFor="fullName"
              >
                <User className="w-4 h-4" />
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label
                  className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  htmlFor="email"
                >
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  htmlFor="phoneNumber"
                >
                  <Phone className="w-4 h-4" />
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Course Selection */}
            <div className="mb-5">
              <label
                className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                htmlFor="courseInterest"
              >
                <BookOpen className="w-4 h-4" />
                Course of Interest <span className="text-red-600">*</span>
              </label>
              <select
                id="courseInterest"
                name="courseInterest"
                value={formData.courseInterest}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all cursor-pointer"
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
                className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                htmlFor="message"
              >
                <MessageSquare className="w-4 h-4" />
                Your Message <span className="text-red-600">*</span>
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
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                  validationErrors.message
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200 bg-red-50"
                    : "border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                }`}
                placeholder="Tell us about your coffee journey and what you hope to learn... (min. 10 characters)"
              ></textarea>
              <div className="flex justify-between items-center mt-2">
                <div>
                  {validationErrors.message && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.message}
                    </p>
                  )}
                </div>
                <p
                  className={`text-xs font-medium ${
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
                className={`flex-1 py-3 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white hover:shadow-md"
                }`}
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
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
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all border border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 text-center shadow-sm">
            <p className="text-sm text-gray-700 mb-2 font-medium flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" />
              Prefer to talk? Call us directly!
            </p>
            <a
              href="tel:+9779826320515"
              className="inline-block text-xl font-bold text-amber-700 hover:text-amber-800 transition-colors no-underline"
            >
              +977 9826320515
            </a>
            <p className="text-xs text-gray-600 mt-2 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Available Mon-Fri, 9 AM - 6 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
