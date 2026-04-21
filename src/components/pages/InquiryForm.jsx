import React, { useState } from "react";
import toast from "react-hot-toast";
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

    // Clear general status message when user edits
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  };

  // Validation helper functions
  const validateFullName = (name) => {
    if (!name || name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (name.length > 100) {
      return "Name must not exceed 100 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 255) {
      return "Email must not exceed 255 characters";
    }
    return null;
  };

  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, "");

    if (!phone || cleanPhone.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (cleanPhone.length > 15) {
      return "Phone number must not exceed 15 digits";
    }
    // Allow common formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number";
    }
    return null;
  };

  const validateMessage = (message) => {
    if (!message || message.trim().length < 10) {
      return "Message must be at least 10 characters long";
    }
    if (message.length > 1000) {
      return "Message must not exceed 1000 characters";
    }
    return null;
  };

  const validateCourse = (course) => {
    if (!course) {
      return "Please select a course";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    setValidationErrors({});

    // Frontend validation
    const errors = {};

    const nameError = validateFullName(formData.fullName);
    if (nameError) errors.fullName = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    const courseError = validateCourse(formData.courseInterest);
    if (courseError) errors.courseInterest = courseError;

    const messageError = validateMessage(formData.message);
    if (messageError) errors.message = messageError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus({
        type: "error",
        message: "Please fix the validation errors below.",
      });
      setLoading(false);
      return;
    }

    // Call service and handle response
    try {
      await inquiryService.submitInquiry(formData);

      toast.success(
        "Thank you! Your inquiry has been submitted successfully. We will contact you soon.",
        {
          duration: 5000,
        },
      );

      setStatus({
        type: "success",
        message: "Inquiry submitted successfully!",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        courseInterest: "",
        message: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to submit inquiry");
      setStatus({
        type: "error",
        message: error.message || "Failed to submit inquiry",
      });
    } finally {
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-16">
      {/* Form Section */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center justify-center p-5 bg-[#1A1A1A] border border-[#ffffff15] rounded-2xl mb-6 shadow-2xl">
              <Coffee className="w-10 h-10 text-[#C6A36A]" strokeWidth={2} />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading text-white mb-4 uppercase tracking-widest">
              Course Inquiry
            </h1>
            <p className="text-[#E0E0E0] text-lg max-w-xl mx-auto font-light leading-relaxed">
              Interested in mastering the art of coffee? Fill out the form below
              and our admissions team will contact you within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="luxury-card p-8 md:p-12"
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
            <div className="mb-6">
              <label
                className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest"
                htmlFor="fullName"
              >
                <User className="w-4 h-4 text-[#C6A36A]" />
                Full Name <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={`w-full luxury-input ${
                  validationErrors.fullName
                    ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                    : ""
                }`}
                placeholder="Enter your full name"
              />
              {validationErrors.fullName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <label
                  className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest"
                  htmlFor="email"
                >
                  <Mail className="w-4 h-4 text-[#C6A36A]" />
                  Email Address <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full luxury-input ${
                    validationErrors.email
                      ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                      : ""
                  }`}
                  placeholder="your.email@example.com"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest"
                  htmlFor="phoneNumber"
                >
                  <Phone className="w-4 h-4 text-[#C6A36A]" />
                  Phone Number <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className={`w-full luxury-input ${
                    validationErrors.phoneNumber
                      ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                      : ""
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Course Selection */}
            <div className="mb-6">
              <label
                className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest"
                htmlFor="courseInterest"
              >
                <BookOpen className="w-4 h-4 text-[#C6A36A]" />
                Course of Interest <span className="text-[#C62828]">*</span>
              </label>
              <select
                id="courseInterest"
                name="courseInterest"
                value={formData.courseInterest}
                onChange={handleChange}
                required
                className={`w-full luxury-input cursor-pointer bg-[#0F0F0F] text-white ${
                  validationErrors.courseInterest
                    ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                    : ""
                }`}
              >
                <option value="" className="bg-[#1A1A1A] text-[#808080]">Choose a program...</option>
                {courses.map((course, index) => (
                  <option key={index} value={course} className="bg-[#1A1A1A] text-white">
                    {course}
                  </option>
                ))}
              </select>
              {validationErrors.courseInterest && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.courseInterest}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-8">
              <label
                className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest"
                htmlFor="message"
              >
                <MessageSquare className="w-4 h-4 text-[#C6A36A]" />
                Your Message <span className="text-[#C62828]">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                minLength={10}
                maxLength={1000}
                required
                className={`w-full luxury-input resize-none ${
                  validationErrors.message
                    ? "border-[#C62828] focus:border-[#C62828] bg-[#C62828]/5"
                    : ""
                }`}
                placeholder="Tell us about your coffee journey and what you hope to learn... (min. 10 characters)"
              ></textarea>
              <div className="flex justify-between items-center mt-3">
                <div>
                  {validationErrors.message && (
                    <p className="text-[#C62828] text-sm flex items-center gap-1">
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
                className={`flex-1 btn-coffee-primary flex items-center justify-center gap-2 ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
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
                className="btn-gold-secondary flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-12 bg-[#1A1A1A] border border-[#ffffff15] p-8 rounded-2xl shadow-2xl text-center group cursor-default">
            <p className="text-sm text-white mb-3 font-heading uppercase tracking-widest flex items-center justify-center gap-3">
              <Phone className="w-4 h-4 text-[#C6A36A]" />
              Prefer to consult directly?
            </p>
            <a
              href="tel:+9779826320515"
              className="inline-block text-2xl md:text-3xl font-heading font-normal text-[#C6A36A] hover:text-white transition-colors no-underline mb-3"
            >
              +977 9826320515
            </a>
            <p className="text-xs text-[#E0E0E0] uppercase tracking-wider flex items-center justify-center gap-2 font-medium">
              <Clock className="w-3 h-3 text-[#C6A36A]" />
              Admissions Available Mon-Fri, 9 AM - 6 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
