import apiInstance from "../config/api";

/**
 * Inquiry Service
 * Handles all inquiry-related API calls
 */

const inquiryService = {
  /**
   * Submit a new inquiry (Public - No Auth Required)
   * @param {Object} inquiryData - The inquiry form data
   * @returns {Promise<Object>}
   */
  submitInquiry: async (inquiryData) => {
    try {
      const response = await apiInstance.post("/api/Inquiry", inquiryData);

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.result,
          message: "Inquiry submitted successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to submit inquiry"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to submit inquiry";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all inquiries with filtering and pagination (Admin/Staff only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  getAllInquiries: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append("status", params.status);
      if (params.assignedToId)
        queryParams.append("assignedToId", params.assignedToId);
      if (params.page) queryParams.append("page", params.page);
      if (params.pageSize) queryParams.append("pageSize", params.pageSize);

      const queryString = queryParams.toString();
      const url = queryString ? `/api/Inquiry?${queryString}` : "/api/Inquiry";

      const response = await apiInstance.get(url);

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch inquiries"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch inquiries";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get inquiry by ID (Admin/Staff only)
   * @param {number} id - Inquiry ID
   * @returns {Promise<Object>}
   */
  getInquiryById: async (id) => {
    try {
      const response = await apiInstance.get(`/api/Inquiry/${id}`);

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch inquiry"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch inquiry";
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete inquiry (Admin only)
   * @param {number} id - Inquiry ID
   * @returns {Promise<Object>}
   */
  deleteInquiry: async (id) => {
    try {
      const response = await apiInstance.delete(`/api/Inquiry/${id}`);

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "Inquiry deleted successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to delete inquiry"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete inquiry";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update inquiry status (Admin/Staff only)
   * @param {number} id - Inquiry ID
   * @param {Object} data - Status update data
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, data) => {
    try {
      const response = await apiInstance.put(
        `/api/Inquiry/${id}/status`,
        data
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "Status updated successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to update status"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      throw new Error(errorMessage);
    }
  },

  /**
   * Assign inquiry to staff (Admin/Staff only)
   * @param {number} id - Inquiry ID
   * @param {number} assignedToId - User ID to assign to
   * @returns {Promise<Object>}
   */
  assignInquiry: async (id, assignedToId) => {
    try {
      const response = await apiInstance.put(`/api/Inquiry/${id}/assign`, {
        assignedToId,
      });

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "Inquiry assigned successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to assign inquiry"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to assign inquiry";
      throw new Error(errorMessage);
    }
  },

  /**
   * Add follow-up note (Admin/Staff only)
   * @param {number} id - Inquiry ID
   * @param {string} note - Follow-up note
   * @returns {Promise<Object>}
   */
  addFollowUp: async (id, note) => {
    try {
      const response = await apiInstance.post(`/api/Inquiry/${id}/followup`, {
        note,
      });

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.result,
          message: "Follow-up added successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to add follow-up"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add follow-up";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get follow-up notes (Admin/Staff only)
   * @param {number} id - Inquiry ID
   * @returns {Promise<Array>}
   */
  getFollowUps: async (id) => {
    try {
      const response = await apiInstance.get(`/api/Inquiry/${id}/followup`);

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") ||
            "Failed to fetch follow-ups"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch follow-ups";
      throw new Error(errorMessage);
    }
  },

  /**
   * Convert inquiry to student (Admin/Staff only)
   * @param {number} id - Inquiry ID
   * @param {Object} data - Student data
   * @returns {Promise<Object>}
   */
  convertToStudent: async (id, data) => {
    try {
      const response = await apiInstance.post(
        `/api/Inquiry/${id}/convert-to-student`,
        data
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.result,
          message: "Inquiry converted to student successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") ||
            "Failed to convert inquiry"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to convert inquiry to student";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get inquiry analytics (Admin/Staff only)
   * @returns {Promise<Object>}
   */
  getAnalytics: async () => {
    try {
      const response = await apiInstance.get("/api/Inquiry/analytics");

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") ||
            "Failed to fetch analytics"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch analytics";
      throw new Error(errorMessage);
    }
  },
};

export default inquiryService;
