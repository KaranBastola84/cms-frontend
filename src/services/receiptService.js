import apiInstance from "../config/api";

/**
 * Receipt Service
 * Handles all receipt management API calls
 * Authorization: Required
 */

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
 * @param {number} receiptData.paymentPlanId - Payment plan ID
 * @param {number} receiptData.installmentId - Installment ID
 * @returns {Promise} Generated receipt details
 */
export const generateReceipt = async (receiptData) => {
  try {
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
    const response = await apiInstance.delete(`/api/Receipt/${id}`);
    return response.data;
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
