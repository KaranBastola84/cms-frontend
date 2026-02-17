import apiInstance from "../config/api";

/**
 * User Management Service for admin operations
 */
const userManagementService = {
  /**
   * Get all users
   * @returns {Promise<Array>} List of all users
   * @throws {Error} If request fails
   */
  getAllUsers: async () => {
    try {
      const response = await apiInstance.get("/api/UserManagement/users");

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch users"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching users";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get a specific user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User data
   * @throws {Error} If request fails
   */
  getUserById: async (userId) => {
    try {
      const response = await apiInstance.get(
        `/api/UserManagement/users/${userId}`
      );

      if (response.data.isSuccess) {
        return response.data.result;
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to fetch user"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching user";
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete a user
   * @param {number} userId - User ID to delete
   * @returns {Promise<Object>} Success response
   * @throws {Error} If request fails
   */
  deleteUser: async (userId) => {
    try {
      const response = await apiInstance.delete(
        `/api/UserManagement/users/${userId}`
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "User deleted successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to delete user"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deleting user";
      throw new Error(errorMessage);
    }
  },

  /**
   * Deactivate a user
   * @param {number} userId - User ID to deactivate
   * @returns {Promise<Object>} Success response
   * @throws {Error} If request fails
   */
  deactivateUser: async (userId) => {
    try {
      const response = await apiInstance.put(
        `/api/UserManagement/users/${userId}/deactivate`
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "User deactivated successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to deactivate user"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deactivating user";
      throw new Error(errorMessage);
    }
  },

  /**
   * Activate a user
   * @param {number} userId - User ID to activate
   * @returns {Promise<Object>} Success response
   * @throws {Error} If request fails
   */
  activateUser: async (userId) => {
    try {
      const response = await apiInstance.put(
        `/api/UserManagement/users/${userId}/activate`
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "User activated successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to activate user"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while activating user";
      throw new Error(errorMessage);
    }
  },

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} newRole - New role (Admin, Staff, Trainer, Student)
   * @returns {Promise<Object>} Success response
   * @throws {Error} If request fails
   */
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await apiInstance.put(
        `/api/UserManagement/users/${userId}/role`,
        {
          newRole,
        }
      );

      if (response.data.isSuccess) {
        return {
          success: true,
          message: response.data.result || "User role updated successfully",
        };
      } else {
        throw new Error(
          response.data.errorMessage?.join(", ") || "Failed to update user role"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errorMessage?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating user role";
      throw new Error(errorMessage);
    }
  },
};

export default userManagementService;
