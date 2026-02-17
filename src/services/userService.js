import apiInstance from "../config/api";

/**
 * User Service for user profile and management operations
 */
const userService = {
  /**
   * Get the current user's profile
   * @returns {Promise<Object>} User profile data
   * @throws {Error} If profile retrieval fails
   */
  getProfile: async () => {
    try {
      const response = await apiInstance.get("/api/UserManagement/profile");

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch profile"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching profile";
      throw new Error(errorMessage);
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<Object>} Success response
   * @throws {Error} If password change fails
   */
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiInstance.put(
        "/api/UserManagement/change-password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        }
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          message: "Password changed successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to change password"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while changing password";
      throw new Error(errorMessage);
    }
  },
};

export default userService;
