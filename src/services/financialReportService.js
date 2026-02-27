import apiInstance from "../config/api";

/**
 * Financial Report Service
 * Handles all financial reporting API calls
 * Authorization: Admin, Staff
 */

// ============================================
// FINANCIAL REPORTS
// ============================================

/**
 * Get financial summary - overall financial health
 * @returns {Promise} {
 *   totalRevenue, totalOutstanding, totalPaidStudents, totalPendingPayments,
 *   productSalesRevenue, studentFeesRevenue
 * }
 */
export const getFinancialSummary = async () => {
  try {
    const response = await apiInstance.get("/api/FinancialReport/summary");
    return response.data.result;
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all students with outstanding/pending payments
 * @returns {Promise} Array of students with payment details
 */
export const getOutstandingPayments = async () => {
  try {
    const response = await apiInstance.get(
      "/api/FinancialReport/outstanding-payments",
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching outstanding payments:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get payment defaulters (students with overdue payments)
 * @param {number} overdueThresholdDays - Number of days overdue (default: 7)
 * @returns {Promise} Array of defaulters
 */
export const getPaymentDefaulters = async (overdueThresholdDays = 7) => {
  try {
    const response = await apiInstance.get("/api/FinancialReport/defaulters", {
      params: { overdueThresholdDays },
    });
    return response.data.result;
  } catch (error) {
    console.error("Error fetching payment defaulters:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get revenue report within date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} Revenue report data
 */
export const getRevenueReport = async (startDate, endDate) => {
  try {
    const response = await apiInstance.get("/api/FinancialReport/revenue", {
      params: { startDate, endDate },
    });
    return response.data.result;
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get revenue for specific course
 * @param {number} courseId - Course ID
 * @param {string} startDate - Optional start date (YYYY-MM-DD)
 * @param {string} endDate - Optional end date (YYYY-MM-DD)
 * @returns {Promise} Course revenue data
 */
export const getCourseRevenue = async (
  courseId,
  startDate = null,
  endDate = null,
) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiInstance.get(
      `/api/FinancialReport/course/${courseId}/revenue`,
      {
        params,
      },
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching course revenue:", error);
    throw error.response?.data || error.message;
  }
};
