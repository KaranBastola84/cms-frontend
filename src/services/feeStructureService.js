import apiInstance from "../config/api";

/**
 * Fee Structure Service
 * Handles all fee structure and course pricing API calls
 * Authorization: Admin, Staff (except where AllowAnonymous)
 */

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate required parameters
 * @param {Object} params - Parameters to validate
 * @param {Array<string>} requiredFields - Required field names
 * @throws {Error} If validation fails
 */
const validateRequired = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null) {
      throw new Error(`${field} is required`);
    }
  }
};

/**
 * Validate ID parameter
 * @param {number} id - ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {Error} If ID is invalid
 */
const validateId = (id, fieldName = "ID") => {
  if (!id || typeof id !== "number" || id <= 0) {
    throw new Error(`Invalid ${fieldName}: must be a positive number`);
  }
};

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
    // Validate required fields
    validateRequired(feeData, ["courseId", "feeType", "amount"]);

    // Validate course ID
    validateId(feeData.courseId, "Course ID");

    // Validate amount
    if (typeof feeData.amount !== "number" || feeData.amount < 0) {
      throw new Error("Amount must be a non-negative number");
    }

    // Validate fee type
    if (typeof feeData.feeType !== "string" || !feeData.feeType.trim()) {
      throw new Error("Fee type must be a non-empty string");
    }

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
    validateId(id, "Fee structure ID");

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
    validateId(courseId, "Course ID");

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
    validateId(courseId, "Course ID");

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
    validateId(id, "Fee structure ID");

    if (!feeData || typeof feeData !== "object") {
      throw new Error("Fee data must be a valid object");
    }

    // Validate amount if provided
    if (
      feeData.amount !== undefined &&
      (typeof feeData.amount !== "number" || feeData.amount < 0)
    ) {
      throw new Error("Amount must be a non-negative number");
    }

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
    validateId(id, "Fee structure ID");

    const response = await apiInstance.delete(`/api/FeeStructure/${id}`);
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    throw error.response?.data || error.message;
  }
};
