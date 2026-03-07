import apiInstance from "../config/api";

/**
 * Financial Report Service
 * Handles all financial reporting API calls
 * Authorization: Admin, Staff
 */

// ============================================
// VALIDATION HELPERS
// ============================================

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

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {Error} If date is invalid
 */
const validateDate = (date, fieldName = "Date") => {
  if (!date || typeof date !== "string") {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} is not a valid date`);
  }
};

/**
 * Validate date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @throws {Error} If date range is invalid
 */
const validateDateRange = (startDate, endDate) => {
  validateDate(startDate, "Start date");
  validateDate(endDate, "End date");

  if (new Date(startDate) > new Date(endDate)) {
    throw new Error("Start date must be before or equal to end date");
  }
};

// ============================================
// FINANCIAL REPORTS
// ============================================

const unwrapResult = (response) => response?.data?.result ?? response?.data;

const normalizeFinancialSummary = (payload = {}) => {
  const totalCashRevenue = Number(payload.totalCashRevenue || 0);
  const totalStripeRevenue = Number(
    payload.totalStripeRevenue ?? payload.studentFeesRevenue ?? 0,
  );

  return {
    ...payload,
    totalCashRevenue,
    totalStripeRevenue,
    totalCashPayments: Number(payload.totalCashPayments || 0),
    // Keep existing `studentFeesRevenue` consumers working.
    studentFeesRevenue:
      payload.studentFeesRevenue !== undefined
        ? Number(payload.studentFeesRevenue || 0)
        : totalStripeRevenue,
    totalRevenue: Number(
      payload.totalRevenue ?? totalCashRevenue + totalStripeRevenue,
    ),
  };
};

const normalizeRevenueReport = (payload = {}) => {
  const cashRevenue = Number(payload.cashRevenue || 0);
  const stripeRevenue = Number(
    payload.stripeRevenue ?? payload.studentFeesRevenue ?? 0,
  );

  const totalRevenue = Number(
    payload.totalRevenue ?? cashRevenue + stripeRevenue,
  );

  return {
    ...payload,
    cashRevenue,
    stripeRevenue,
    cashPaymentCount: Number(payload.cashPaymentCount || 0),
    // Backward-compatible alias used in older UI.
    studentFeesRevenue:
      payload.studentFeesRevenue !== undefined
        ? Number(payload.studentFeesRevenue || 0)
        : stripeRevenue,
    totalRevenue,
    averageTransactionValue:
      payload.averageTransactionValue !== undefined
        ? Number(payload.averageTransactionValue || 0)
        : Number(payload.totalTransactions || 0) > 0
          ? totalRevenue / Number(payload.totalTransactions)
          : 0,
  };
};

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
    return normalizeFinancialSummary(unwrapResult(response) || {});
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
    return unwrapResult(response) || [];
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
    // Validate threshold days
    if (typeof overdueThresholdDays !== "number" || overdueThresholdDays < 0) {
      throw new Error("Overdue threshold days must be a non-negative number");
    }

    const response = await apiInstance.get("/api/FinancialReport/defaulters", {
      params: { overdueThresholdDays },
    });
    return unwrapResult(response) || [];
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
    validateDateRange(startDate, endDate);

    const response = await apiInstance.get("/api/FinancialReport/revenue", {
      params: { startDate, endDate },
    });
    return normalizeRevenueReport(unwrapResult(response) || {});
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
    validateId(courseId, "Course ID");

    const params = {};
    if (startDate && endDate) {
      validateDateRange(startDate, endDate);
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (startDate || endDate) {
      throw new Error("Both startDate and endDate must be provided together");
    }

    const response = await apiInstance.get(
      `/api/FinancialReport/course/${courseId}/revenue`,
      {
        params,
      },
    );
    return unwrapResult(response);
  } catch (error) {
    console.error("Error fetching course revenue:", error);
    throw error.response?.data || error.message;
  }
};
