import apiInstance from "../config/api";

/**
 * Staff Management Service
 * Handles all staff-related operations including creation, verification, activation, and password management
 */
const staffManagementService = {
  /**
   * Admin: Create a new staff account and send OTP
   * @param {Object} staffData - Staff creation data
   * @param {string} staffData.firstName - First name (required)
   * @param {string} staffData.lastName - Last name (required)
   * @param {string} staffData.email - Email address (required)
   * @param {string} staffData.phoneNumber - Phone number (required)
   * @param {string} staffData.staffRole - Staff role (required, e.g., "Barista Trainer", "Front Desk")
   * @returns {Promise<Object>} Staff ID and confirmation message
   * @throws {Error} If request fails
   */
  createStaff: async (staffData) => {
    try {
      const response = await apiInstance.post(
        "/api/StaffManagement/create",
        staffData
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to create staff"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while creating staff";
      throw new Error(errorMessage);
    }
  },

  /**
   * Public: Staff verifies OTP and sets their password (No auth required)
   * @param {Object} verifyData - Verification data
   * @param {string} verifyData.email - Staff email (required)
   * @param {string} verifyData.otp - 6-digit OTP (required)
   * @param {string} verifyData.password - Password (required, min 6 characters)
   * @returns {Promise<Object>} Verification confirmation
   * @throws {Error} If request fails
   */
  verifyOTP: async (verifyData) => {
    try {
      const response = await apiInstance.post(
        "/api/StaffManagement/verify-otp",
        verifyData
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to verify OTP"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while verifying OTP";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Activate a verified staff account
   * @param {number} staffId - Staff user ID
   * @returns {Promise<Object>} Activation confirmation
   * @throws {Error} If request fails
   */
  activateStaff: async (staffId) => {
    try {
      const response = await apiInstance.put(
        `/api/StaffManagement/${staffId}/activate`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to activate staff"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while activating staff";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Deactivate a staff account
   * @param {number} staffId - Staff user ID
   * @returns {Promise<Object>} Deactivation confirmation
   * @throws {Error} If request fails
   */
  deactivateStaff: async (staffId) => {
    try {
      const response = await apiInstance.put(
        `/api/StaffManagement/${staffId}/deactivate`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to deactivate staff"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deactivating staff";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Get list of all staff members
   * @returns {Promise<Array>} List of all staff members
   * @throws {Error} If request fails
   */
  getAllStaff: async () => {
    try {
      const response = await apiInstance.get("/api/StaffManagement");

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch staff"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching staff";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Get details of a specific staff member
   * @param {number} staffId - Staff user ID
   * @returns {Promise<Object>} Staff details including verification and activation status
   * @throws {Error} If request fails
   */
  getStaffById: async (staffId) => {
    try {
      const response = await apiInstance.get(`/api/StaffManagement/${staffId}`);

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch staff details"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching staff details";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Delete a staff account
   * @param {number} staffId - Staff user ID
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {Error} If request fails
   */
  deleteStaff: async (staffId) => {
    try {
      const response = await apiInstance.delete(
        `/api/StaffManagement/${staffId}`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to delete staff"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deleting staff";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Resend OTP to unverified staff
   * @param {number} staffId - Staff user ID
   * @returns {Promise<Object>} OTP resend confirmation
   * @throws {Error} If request fails
   */
  resendOTP: async (staffId) => {
    try {
      const response = await apiInstance.post(
        `/api/StaffManagement/${staffId}/resend-otp`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to resend OTP"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while resending OTP";
      throw new Error(errorMessage);
    }
  },

  /**
   * Staff: Request to change password (sends OTP)
   * Requires authenticated staff user
   * @returns {Promise<Object>} OTP sent confirmation
   * @throws {Error} If request fails
   */
  requestPasswordChange: async () => {
    try {
      const response = await apiInstance.post(
        "/api/StaffManagement/request-password-change"
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") ||
            "Failed to request password change"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while requesting password change";
      throw new Error(errorMessage);
    }
  },

  /**
   * Staff: Verify OTP and set new password
   * Requires authenticated staff user
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.otp - 6-digit OTP (required)
   * @param {string} passwordData.newPassword - New password (required, min 6 characters)
   * @param {string} passwordData.confirmPassword - Confirm password (required, must match newPassword)
   * @returns {Promise<Object>} Password change confirmation
   * @throws {Error} If request fails
   */
  verifyPasswordChange: async (passwordData) => {
    try {
      const response = await apiInstance.post(
        "/api/StaffManagement/verify-password-change",
        passwordData
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") ||
            "Failed to verify password change"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while verifying password change";
      throw new Error(errorMessage);
    }
  },
};

export default staffManagementService;
