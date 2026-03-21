import apiInstance from "../config/api";
import { extractApiErrorMessage } from "../utils/helpers";

const throwApiError = (error, fallbackMessage) => {
  throw new Error(extractApiErrorMessage(error, fallbackMessage));
};

/**
 * Stripe Payment Service
 * Handles all Stripe payment processing API calls
 * Authorization: Required (except webhook)
 */

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Valid currency codes
 */
const VALID_CURRENCIES = ["usd", "eur", "gbp", "cad", "aud", "jpy", "inr"];

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
 * Validate currency code
 * @param {string} currency - Currency code to validate
 * @throws {Error} If currency is invalid
 */
const validateCurrency = (currency) => {
  if (!currency || typeof currency !== "string") {
    throw new Error("Currency is required and must be a string");
  }

  const normalizedCurrency = currency.toLowerCase();
  if (!VALID_CURRENCIES.includes(normalizedCurrency)) {
    throw new Error(
      `Invalid currency. Must be one of: ${VALID_CURRENCIES.join(", ")}`,
    );
  }
};

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
 * @param {number} [paymentData.paymentPlanId] - Payment plan ID (optional)
 * @param {number} [paymentData.installmentId] - Installment ID (optional)
 * @returns {Promise} { paymentId, clientSecret, amount, status }
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    // Validate required fields
    validateRequired(paymentData, ["studentId", "amount", "description"]);

    // Validate student ID
    validateId(paymentData.studentId, "Student ID");

    // Validate amount
    if (typeof paymentData.amount !== "number" || paymentData.amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // Validate currency (default to "usd" if not provided)
    const currency = paymentData.currency || "usd";
    validateCurrency(currency);

    // Validate description
    if (
      typeof paymentData.description !== "string" ||
      !paymentData.description.trim()
    ) {
      throw new Error("Description must be a non-empty string");
    }

    // Validate optional IDs if provided
    if (
      paymentData.paymentPlanId !== undefined &&
      paymentData.paymentPlanId !== null
    ) {
      validateId(paymentData.paymentPlanId, "Payment plan ID");
    }
    if (
      paymentData.installmentId !== undefined &&
      paymentData.installmentId !== null
    ) {
      validateId(paymentData.installmentId, "Installment ID");
    }

    const response = await apiInstance.post(
      "/api/StripePayment/create-payment-intent",
      { ...paymentData, currency },
    );
    return response.data.result;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throwApiError(error, "Failed to create payment intent");
  }
};

/**
 * Get payment details by payment ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    validateId(paymentId, "Payment ID");

    const response = await apiInstance.get(`/api/StripePayment/${paymentId}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throwApiError(error, "Failed to fetch payment details");
  }
};

/**
 * Get all Stripe payments for a student
 * @param {number} studentId - Student ID
 * @returns {Promise} Array of student payments
 */
export const getStudentPayments = async (studentId) => {
  try {
    validateId(studentId, "Student ID");

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
    validateId(paymentId, "Payment ID");

    const response = await apiInstance.post(
      `/api/StripePayment/${paymentId}/confirm`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Confirm payment using Stripe PaymentIntent ID
 * @param {string} paymentIntentId - Stripe PaymentIntent ID (pi_...)
 * @returns {Promise} Confirmation result
 */
export const confirmPaymentByIntent = async (paymentIntentId) => {
  try {
    if (
      !paymentIntentId ||
      typeof paymentIntentId !== "string" ||
      !paymentIntentId.trim()
    ) {
      throw new Error("PaymentIntent ID is required");
    }

    const response = await apiInstance.post(
      `/api/StripePayment/confirm-by-intent/${encodeURIComponent(paymentIntentId.trim())}`,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error confirming payment by intent:", error);
    throwApiError(error, "Failed to confirm payment");
  }
};

/**
 * Cancel a payment intent (Admin/Staff)
 * @param {number} paymentId - Payment ID
 * @param {string} reason - Cancellation reason (optional)
 * @returns {Promise} { paymentId, status, cancelledAt }
 */
export const cancelPayment = async (paymentId, reason = null) => {
  try {
    validateId(paymentId, "Payment ID");

    const requestBody = {};
    if (reason && typeof reason === "string") {
      requestBody.reason = reason;
    }

    const response = await apiInstance.post(
      `/api/StripePayment/${paymentId}/cancel`,
      requestBody,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error cancelling payment:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Refund a payment (Admin only)
 * @param {number} paymentId - Payment ID
 * @param {Object} refundData - Refund details
 * @param {number} [refundData.amount] - Refund amount (optional, defaults to full refund)
 * @param {string} [refundData.reason] - Refund reason (optional)
 * @returns {Promise} { refundId, paymentId, amount, status }
 */
export const refundPayment = async (paymentId, refundData = {}) => {
  try {
    validateId(paymentId, "Payment ID");

    // Validate refund amount if provided
    if (refundData.amount !== undefined && refundData.amount !== null) {
      if (typeof refundData.amount !== "number" || refundData.amount <= 0) {
        throw new Error("Refund amount must be a positive number");
      }
    }

    const response = await apiInstance.post(
      `/api/StripePayment/${paymentId}/refund`,
      refundData,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error refunding payment:", error);
    throw error.response?.data || error.message;
  }
};
