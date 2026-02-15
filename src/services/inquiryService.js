import apiInstance from "../config/api";

/**
 * Inquiry Service
 * Handles all inquiry-related API calls
 */

const inquiryService = {
  /**
   * Submit a new inquiry
   * @param {Object} inquiryData - The inquiry form data
   * @param {string} inquiryData.fullName - Full name of the inquirer
   * @param {string} inquiryData.email - Email address
   * @param {string} inquiryData.phoneNumber - Phone number
   * @param {string} inquiryData.courseInterest - Course interested in
   * @param {string} inquiryData.message - Inquiry message (10-1000 chars)
   * @returns {Promise<{success: boolean, data: any, message: string, errors: object}>}
   */
  submitInquiry: async (inquiryData) => {
    try {
      const response = await apiInstance.post("/api/Inquiry", inquiryData);

      return {
        success: true,
        data: response.data,
        message: "Inquiry submitted successfully",
        errors: null,
      };
    } catch (error) {
      console.error("Submit Inquiry Error:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        return {
          success: false,
          data: null,
          message: "Validation failed",
          errors: error.response.data.errors,
        };
      }

      // Handle other errors
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.message ||
          "Failed to submit inquiry",
        errors: null,
      };
    }
  },

  /**
   * Get all inquiries (for admin panel - future use)
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getAllInquiries: async () => {
    try {
      const response = await apiInstance.get("/api/Inquiry");

      return {
        success: true,
        data: response.data,
        message: "Inquiries fetched successfully",
      };
    } catch (error) {
      console.error("Get All Inquiries Error:", error);

      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch inquiries",
      };
    }
  },

  /**
   * Get inquiry by ID (for admin panel - future use)
   * @param {number} id - Inquiry ID
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  getInquiryById: async (id) => {
    try {
      const response = await apiInstance.get(`/api/Inquiry/${id}`);

      return {
        success: true,
        data: response.data,
        message: "Inquiry fetched successfully",
      };
    } catch (error) {
      console.error("Get Inquiry By ID Error:", error);

      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch inquiry",
      };
    }
  },

  /**
   * Delete inquiry (for admin panel - future use)
   * @param {number} id - Inquiry ID
   * @returns {Promise<{success: boolean, data: any, message: string}>}
   */
  deleteInquiry: async (id) => {
    try {
      const response = await apiInstance.delete(`/api/Inquiry/${id}`);

      return {
        success: true,
        data: response.data,
        message: "Inquiry deleted successfully",
      };
    } catch (error) {
      console.error("Delete Inquiry Error:", error);

      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete inquiry",
      };
    }
  },
};

export default inquiryService;
