import apiInstance from "../config/api";

/**
 * Fee Structure Service
 * Handles all fee structure and course pricing API calls
 * Authorization: Admin, Staff (except where AllowAnonymous)
 */

// ============================================
// FEE STRUCTURE MANAGEMENT
// ============================================

/**
 * Create a new fee structure
 * @param {Object} feeData - Fee structure details
 * @param {number} feeData.courseId - Course ID
 * @param {string} feeData.feeType - Fee type (e.g., "CourseFee", "RegistrationFee")
 * @param {number} feeData.amount - Fee amount
 * @param {string} feeData.description - Fee description
 * @param {boolean} feeData.isActive - Active status
 * @returns {Promise} Created fee structure
 */
export const createFeeStructure = async (feeData) => {
  try {
    const response = await apiInstance.post("/api/FeeStructure", feeData);
    return response.data.result;
  } catch (error) {
    console.error("Error creating fee structure:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get fee structure by ID
 * @param {number} id - Fee structure ID
 * @returns {Promise} Fee structure details
 */
export const getFeeStructureById = async (id) => {
  try {
    const response = await apiInstance.get(`/api/FeeStructure/${id}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all fee structures
 * @returns {Promise} Array of all fee structures
 */
export const getAllFeeStructures = async () => {
  try {
    const response = await apiInstance.get("/api/FeeStructure");
    return response.data.result;
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get fee structures for a specific course (Public - no auth required)
 * @param {number} courseId - Course ID
 * @returns {Promise} Array of course fees
 */
export const getCourseFees = async (courseId) => {
  try {
    const response = await apiInstance.get(
      `/api/FeeStructure/course/${courseId}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching course fees:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get total fee for a course with breakdown (Public - no auth required)
 * @param {number} courseId - Course ID
 * @returns {Promise} { courseId, courseName, totalFee, breakdown }
 */
export const getCourseTotalFee = async (courseId) => {
  try {
    const response = await apiInstance.get(
      `/api/FeeStructure/course/${courseId}/total`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching course total fee:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update fee structure
 * @param {number} id - Fee structure ID
 * @param {Object} feeData - Updated fee structure data
 * @returns {Promise} Updated fee structure
 */
export const updateFeeStructure = async (id, feeData) => {
  try {
    const response = await apiInstance.put(`/api/FeeStructure/${id}`, feeData);
    return response.data.result;
  } catch (error) {
    console.error("Error updating fee structure:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete fee structure
 * @param {number} id - Fee structure ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteFeeStructure = async (id) => {
  try {
    const response = await apiInstance.delete(`/api/FeeStructure/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    throw error.response?.data || error.message;
  }
};
