import apiInstance from "../config/api";

/**
 * Receipt Service
 * Handles all receipt management API calls
 * Authorization: Required
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
// RECEIPT MANAGEMENT
// ============================================

/**
 * Generate a new receipt
 * @param {Object} receiptData - Receipt details
 * @param {number} receiptData.studentId - Student ID
 * @param {number} receiptData.amount - Payment amount
 * @param {string} receiptData.paymentMethod - Payment method (e.g., "Stripe")
 * @param {string} receiptData.description - Payment description
 * @param {number} [receiptData.paymentPlanId] - Payment plan ID (optional)
 * @param {number} [receiptData.installmentId] - Installment ID (optional)
 * @returns {Promise} Generated receipt details
 */
export const generateReceipt = async (receiptData) => {
  try {
    // Validate required fields
    validateRequired(receiptData, [
      "studentId",
      "amount",
      "paymentMethod",
      "description",
    ]);

    // Validate student ID
    validateId(receiptData.studentId, "Student ID");

    // Validate amount
    if (typeof receiptData.amount !== "number" || receiptData.amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // Validate payment method
    if (
      typeof receiptData.paymentMethod !== "string" ||
      !receiptData.paymentMethod.trim()
    ) {
      throw new Error("Payment method must be a non-empty string");
    }

    // Validate optional IDs if provided
    if (
      receiptData.paymentPlanId !== undefined &&
      receiptData.paymentPlanId !== null
    ) {
      validateId(receiptData.paymentPlanId, "Payment plan ID");
    }
    if (
      receiptData.installmentId !== undefined &&
      receiptData.installmentId !== null
    ) {
      validateId(receiptData.installmentId, "Installment ID");
    }

    const response = await apiInstance.post("/api/Receipt", receiptData);
    return response.data.result;
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get receipt by ID
 * @param {number} id - Receipt ID
 * @returns {Promise} Receipt details
 */
export const getReceiptById = async (id) => {
  try {
    validateId(id, "Receipt ID");

    const response = await apiInstance.get(`/api/Receipt/${id}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all receipts for a student
 * @param {number} studentId - Student ID
 * @returns {Promise} Array of receipts
 */
export const getStudentReceipts = async (studentId) => {
  try {
    validateId(studentId, "Student ID");

    const response = await apiInstance.get(`/api/Receipt/student/${studentId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching student receipts:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get receipt by receipt number
 * @param {string} receiptNumber - Receipt number (e.g., "RCT-2026-0123")
 * @returns {Promise} Receipt details
 */
export const getReceiptByNumber = async (receiptNumber) => {
  try {
    if (
      !receiptNumber ||
      typeof receiptNumber !== "string" ||
      !receiptNumber.trim()
    ) {
      throw new Error("Receipt number must be a non-empty string");
    }

    const response = await apiInstance.get(
      `/api/Receipt/number/${receiptNumber}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching receipt by number:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Download receipt as PDF
 * @param {number} id - Receipt ID
 * @returns {Promise} PDF file blob
 */
export const downloadReceiptPDF = async (id) => {
  try {
    validateId(id, "Receipt ID");

    const response = await apiInstance.get(`/api/Receipt/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading receipt PDF:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete receipt (Admin only)
 * @param {number} id - Receipt ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteReceipt = async (id) => {
  try {
    validateId(id, "Receipt ID");

    const response = await apiInstance.delete(`/api/Receipt/${id}`);
    return response.data.result || response.data;
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Download receipt PDF and trigger browser download
 * @param {number} id - Receipt ID
 * @param {string} filename - Filename for download (default: receipt-{id}.pdf)
 */
export const downloadReceipt = async (id, filename = null) => {
  try {
    validateId(id, "Receipt ID");

    const blob = await downloadReceiptPDF(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `receipt-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    throw error;
  }
};
