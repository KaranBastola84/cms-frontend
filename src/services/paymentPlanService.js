import apiInstance from "../config/api";

/**
 * Payment Plan Service
 * Handles all payment plan and installment management API calls
 * Authorization: Required
 */

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
    const params = days ? { days } : {};
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
