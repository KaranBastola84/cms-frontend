import apiInstance from "../config/api";

/**
 * Trainer Management Service
 * Handles all trainer-related operations including creation, verification, activation, and password management
 */
const trainerManagementService = {
  /**
   * Admin: Create a new trainer account and send OTP
   * @param {Object} trainerData - Trainer creation data
   * @param {string} trainerData.firstName - First name (required)
   * @param {string} trainerData.lastName - Last name (required)
   * @param {string} trainerData.email - Email address (required)
   * @param {string} trainerData.phoneNumber - Phone number (required)
   * @param {string} trainerData.trainerRole - Trainer role (required, e.g., "Barista Trainer", "Latte Art Trainer")
   * @returns {Promise<Object>} Trainer ID and confirmation message
   * @throws {Error} If request fails
   */
  createTrainer: async (trainerData) => {
    try {
      const response = await apiInstance.post(
        "/api/TrainerManagement/create",
        trainerData
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to create trainer"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while creating trainer";
      throw new Error(errorMessage);
    }
  },

  /**
   * Public: Trainer verifies OTP and sets their password (No auth required)
   * @param {Object} verifyData - Verification data
   * @param {string} verifyData.email - Trainer email (required)
   * @param {string} verifyData.otp - 6-digit OTP (required)
   * @param {string} verifyData.password - Password (required, min 6 characters)
   * @returns {Promise<Object>} Verification confirmation
   * @throws {Error} If request fails
   */
  verifyOTP: async (verifyData) => {
    try {
      const response = await apiInstance.post(
        "/api/TrainerManagement/verify-otp",
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
   * Admin: Activate a verified trainer account
   * @param {number} trainerId - Trainer user ID
   * @returns {Promise<Object>} Activation confirmation
   * @throws {Error} If request fails
   */
  activateTrainer: async (trainerId) => {
    try {
      const response = await apiInstance.put(
        `/api/TrainerManagement/${trainerId}/activate`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to activate trainer"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while activating trainer";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Deactivate a trainer account
   * @param {number} trainerId - Trainer user ID
   * @returns {Promise<Object>} Deactivation confirmation
   * @throws {Error} If request fails
   */
  deactivateTrainer: async (trainerId) => {
    try {
      const response = await apiInstance.put(
        `/api/TrainerManagement/${trainerId}/deactivate`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to deactivate trainer"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deactivating trainer";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Get list of all trainers
   * @returns {Promise<Array>} List of all trainers
   * @throws {Error} If request fails
   */
  getAllTrainers: async () => {
    try {
      const response = await apiInstance.get("/api/TrainerManagement");

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch trainers"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching trainers";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Get details of a specific trainer
   * @param {number} trainerId - Trainer user ID
   * @returns {Promise<Object>} Trainer details including verification and activation status
   * @throws {Error} If request fails
   */
  getTrainerById: async (trainerId) => {
    try {
      const response = await apiInstance.get(`/api/TrainerManagement/${trainerId}`);

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch trainer details"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching trainer details";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Delete a trainer account
   * @param {number} trainerId - Trainer user ID
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {Error} If request fails
   */
  deleteTrainer: async (trainerId) => {
    try {
      const response = await apiInstance.delete(
        `/api/TrainerManagement/${trainerId}`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to delete trainer"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deleting trainer";
      throw new Error(errorMessage);
    }
  },

  /**
   * Admin: Resend OTP to unverified trainer
   * @param {number} trainerId - Trainer user ID
   * @returns {Promise<Object>} OTP resend confirmation
   * @throws {Error} If request fails
   */
  resendOTP: async (trainerId) => {
    try {
      const response = await apiInstance.post(
        `/api/TrainerManagement/${trainerId}/resend-otp`
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
   * Trainer: Request to change password (sends OTP)
   * Requires authenticated trainer user
   * @returns {Promise<Object>} OTP sent confirmation
   * @throws {Error} If request fails
   */
  requestPasswordChange: async () => {
    try {
      const response = await apiInstance.post(
        "/api/TrainerManagement/request-password-change"
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
   * Trainer: Verify OTP and set new password
   * Requires authenticated trainer user
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
        "/api/TrainerManagement/verify-password-change",
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

export default trainerManagementService;
