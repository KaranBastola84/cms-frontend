import apiInstance from "../config/api";

/**
 * Payment Plan Service
 * Handles all payment plan and installment management API calls
 * Authorization: Required
 */

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Valid installment frequency values
 */
const VALID_FREQUENCIES = [
  "Daily",
  "Weekly",
  "BiWeekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

/**
 * Valid payment plan status values
 */
const VALID_STATUSES = ["Active", "Completed", "Cancelled", "OnHold"];

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
 * Validate installment frequency
 * @param {string} frequency - Frequency to validate
 * @throws {Error} If frequency is invalid
 */
const validateFrequency = (frequency) => {
  if (!VALID_FREQUENCIES.includes(frequency)) {
    throw new Error(
      `Invalid frequency. Must be one of: ${VALID_FREQUENCIES.join(", ")}`,
    );
  }
};

/**
 * Validate payment plan status
 * @param {string} status - Status to validate
 * @throws {Error} If status is invalid
 */
const validateStatus = (status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }
};

// ============================================
// PAYMENT PLAN MANAGEMENT
// ============================================

/**
 * Create a new payment plan
 * @param {Object} planData - Payment plan details
 * @param {number} planData.studentId - Student ID
 * @param {number} planData.courseId - Course ID
 * @param {number} planData.totalAmount - Total amount
 * @param {number} planData.numberOfInstallments - Number of installments
 * @param {string} planData.firstInstallmentDate - First installment date (YYYY-MM-DD)
 * @param {string} planData.installmentFrequency - Frequency (e.g., "Monthly")
 * @param {string} planData.description - Plan description
 * @returns {Promise} Created payment plan with installments
 */
export const createPaymentPlan = async (planData) => {
  try {
    // Validate required fields
    validateRequired(planData, [
      "studentId",
      "courseId",
      "totalAmount",
      "numberOfInstallments",
      "firstInstallmentDate",
      "installmentFrequency",
    ]);

    // Validate IDs
    validateId(planData.studentId, "Student ID");
    validateId(planData.courseId, "Course ID");

    // Validate total amount
    if (typeof planData.totalAmount !== "number" || planData.totalAmount <= 0) {
      throw new Error("Total amount must be a positive number");
    }

    // Validate number of installments
    if (
      typeof planData.numberOfInstallments !== "number" ||
      planData.numberOfInstallments <= 0 ||
      !Number.isInteger(planData.numberOfInstallments)
    ) {
      throw new Error("Number of installments must be a positive integer");
    }

    // Validate date
    validateDate(planData.firstInstallmentDate, "First installment date");

    // Validate frequency
    validateFrequency(planData.installmentFrequency);

    const response = await apiInstance.post("/api/PaymentPlan", planData);
    return response.data.result;
  } catch (error) {
    console.error("Error creating payment plan:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get payment plan by ID
 * @param {number} id - Payment plan ID
 * @returns {Promise} Payment plan details with installments
 */
export const getPaymentPlanById = async (id) => {
  try {
    validateId(id, "Payment plan ID");

    const response = await apiInstance.get(`/api/PaymentPlan/${id}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching payment plan:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all payment plans for a student
 * @param {number} studentId - Student ID
 * @returns {Promise} Array of payment plans
 */
export const getStudentPaymentPlans = async (studentId) => {
  try {
    validateId(studentId, "Student ID");

    const response = await apiInstance.get(
      `/api/PaymentPlan/student/${studentId}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching student payment plans:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all payment plans for a course (Admin/Staff)
 * @param {number} courseId - Course ID
 * @returns {Promise} Array of payment plans
 */
export const getCoursePaymentPlans = async (courseId) => {
  try {
    validateId(courseId, "Course ID");

    const response = await apiInstance.get(
      `/api/PaymentPlan/course/${courseId}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching course payment plans:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update payment plan status
 * @param {number} id - Payment plan ID
 * @param {string} status - New status (Active, Completed, Cancelled, OnHold)
 * @returns {Promise} Updated payment plan
 */
export const updatePaymentPlanStatus = async (id, status) => {
  try {
    validateId(id, "Payment plan ID");
    validateStatus(status);

    const response = await apiInstance.put(`/api/PaymentPlan/${id}/status`, {
      status,
    });
    return response.data.result;
  } catch (error) {
    console.error("Error updating payment plan status:", error);
    throw error.response?.data || error.message;
  }
};

// ============================================
// INSTALLMENT MANAGEMENT
// ============================================

/**
 * Get installment details
 * @param {number} installmentId - Installment ID
 * @returns {Promise} Installment details
 */
export const getInstallmentById = async (installmentId) => {
  try {
    validateId(installmentId, "Installment ID");

    const response = await apiInstance.get(
      `/api/PaymentPlan/installments/${installmentId}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching installment:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Mark installment as paid
 * @param {number} installmentId - Installment ID
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.paymentMethod - Payment method
 * @param {string} paymentData.transactionId - Transaction ID
 * @param {string} paymentData.paymentDate - Payment date (ISO format)
 * @param {string} paymentData.notes - Optional notes
 * @returns {Promise} Updated installment details
 */
export const payInstallment = async (installmentId, paymentData) => {
  try {
    validateId(installmentId, "Installment ID");

    // Validate required fields
    validateRequired(paymentData, ["amount", "paymentMethod", "paymentDate"]);

    // Validate amount
    if (typeof paymentData.amount !== "number" || paymentData.amount <= 0) {
      throw new Error("Payment amount must be a positive number");
    }

    // Validate payment method
    if (
      typeof paymentData.paymentMethod !== "string" ||
      !paymentData.paymentMethod.trim()
    ) {
      throw new Error("Payment method is required");
    }

    // Validate payment date (ISO format)
    const paymentDate = new Date(paymentData.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      throw new Error("Payment date must be a valid date");
    }

    const response = await apiInstance.post(
      `/api/PaymentPlan/installments/${installmentId}/pay`,
      paymentData,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error paying installment:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get overdue installments
 * @param {number} days - Optional: number of days overdue
 * @returns {Promise} Array of overdue installments
 */
export const getOverdueInstallments = async (days = null) => {
  try {
    const params = {};

    if (days !== null) {
      if (typeof days !== "number" || days < 0) {
        throw new Error("Days must be a non-negative number");
      }
      params.days = days;
    }

    const response = await apiInstance.get(
      "/api/PaymentPlan/installments/overdue",
      { params },
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching overdue installments:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get upcoming installments
 * @param {number} days - Number of days ahead to check (default: 7)
 * @returns {Promise} Array of upcoming installments
 */
export const getUpcomingInstallments = async (days = 7) => {
  try {
    if (typeof days !== "number" || days < 0) {
      throw new Error("Days must be a non-negative number");
    }

    const response = await apiInstance.get(
      "/api/PaymentPlan/installments/upcoming",
      {
        params: { days },
      },
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching upcoming installments:", error);
    throw error.response?.data || error.message;
  }
};
