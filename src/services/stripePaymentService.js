import apiInstance from "../config/api";

/**
 * Stripe Payment Service
 * Handles all Stripe payment processing API calls
 * Authorization: Required (except webhook)
 */

// ============================================
// STRIPE PAYMENT PROCESSING
// ============================================

/**
 * Create payment intent for student fees
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.studentId - Student ID
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.currency - Currency (default: "usd")
 * @param {string} paymentData.description - Payment description
 * @param {number} paymentData.paymentPlanId - Payment plan ID
 * @param {number} paymentData.installmentId - Installment ID
 * @returns {Promise} { paymentId, clientSecret, amount, status }
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await apiInstance.post(
      "/api/StripePayment/create-payment-intent",
      paymentData,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get payment details by payment ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await apiInstance.get(`/api/StripePayment/${paymentId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all Stripe payments for a student
 * @param {number} studentId - Student ID
 * @returns {Promise} Array of student payments
 */
export const getStudentPayments = async (studentId) => {
  try {
    const response = await apiInstance.get(
      `/api/StripePayment/student/${studentId}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching student payments:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Confirm payment manually if needed
 * @param {number} paymentId - Payment ID
 * @returns {Promise} { paymentId, status, confirmedAt }
 */
export const confirmPayment = async (paymentId) => {
  try {
    const response = await apiInstance.post(
      `/api/StripePayment/${paymentId}/confirm`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error.response?.data || error.message;
  }
};
