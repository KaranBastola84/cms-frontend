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
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Form Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-5xl">☕</span>
              <h1 className="text-4xl font-bold text-amber-900">
                Submit Your Inquiry
              </h1>
            </div>
            <p className="text-amber-800 text-lg">
              Interested in our coffee courses? Fill out the form below and
              we'll get back to you soon!
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-200"
          >
            {/* Status Message */}
            {status.message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Name */}
            <div className="mb-6">
              <label
                className="block text-amber-900 font-semibold mb-2"
                htmlFor="fullName"
              >
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-200 focus:outline-none transition"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <label
                className="block text-amber-900 font-semibold mb-2"
                htmlFor="email"
              >
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-200 focus:outline-none transition"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label
                className="block text-amber-900 font-semibold mb-2"
                htmlFor="phoneNumber"
              >
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-200 focus:outline-none transition"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Course Selection */}
            <div className="mb-6">
              <label
                className="block text-amber-900 font-semibold mb-2"
                htmlFor="courseInterest"
              >
                Course of Interest <span className="text-red-600">*</span>
              </label>
              <select
                id="courseInterest"
                name="courseInterest"
                value={formData.courseInterest}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 focus:ring-2 focus:ring-amber-200 focus:outline-none transition"
              >
                <option value="">Select a course</option>
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
                className="block text-amber-900 font-semibold mb-2"
                htmlFor="message"
              >
                Additional Message <span className="text-red-600">*</span>
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
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  validationErrors.message
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200"
                    : "border-amber-300 focus:border-amber-600 focus:ring-amber-200"
                }`}
                placeholder="Tell us more about your interest or any questions you have... (minimum 10 characters)"
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
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-amber-700 text-white py-4 rounded-lg font-bold text-lg transition shadow-lg ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-amber-800 hover:shadow-xl"
                }`}
              >
                {loading ? "Submitting..." : "Submit Inquiry"}
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
                className="px-8 py-4 bg-amber-100 text-amber-900 rounded-lg font-bold hover:bg-amber-200 transition border-2 border-amber-300"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center text-amber-800">
            <p>
              Or call us directly at{" "}
              <a
                href="tel:+9779826320515"
                className="text-amber-900 font-bold hover:text-amber-700 transition"
              >
                +977 9826320515
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
