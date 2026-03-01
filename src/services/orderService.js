import apiInstance from "../config/api";

/**
 * Order Service
 * Handles all order-related API calls for sales management
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Create new order (Public - No Auth Required)
 * @param {Object} orderData - Order information
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.customerEmail - Customer email
 * @param {string} orderData.customerPhone - Customer phone number
 * @param {string} orderData.deliveryAddress - Delivery address
 * @param {string} orderData.customerNotes - Optional customer notes
 * @param {Array} orderData.orderItems - Array of order items
 * @param {number} orderData.orderItems[].productId - Product ID
 * @param {number} orderData.orderItems[].quantity - Quantity ordered
 * @returns {Promise} Created order with order ID and number
 *
 * Features:
 * - Validates product availability and stock
 * - Auto-calculates total amount
 * - Generates unique order number (ORD-{year}-{sequential})
 * - Sends confirmation email
 * - Stock NOT reduced (only when admin confirms)
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiInstance.post("/api/Order", orderData);
    return response.data.result; // API returns { result, isSuccess, statusCode, errorMessage }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get order details by ID (Public/Admin - for order confirmation/management)
 * @param {number} id - Order ID
 * @returns {Promise} Order details with items and status
 */
export const getOrderById = async (id) => {
  try {
    const response = await apiInstance.get(`/api/Order/${id}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get customer orders by email (Admin only)
 * @param {string} email - Customer email
 * @returns {Promise} Array of customer orders
 */
export const getOrdersByCustomerEmail = async (email) => {
  try {
    const response = await apiInstance.get(`/api/Order/customer/${email}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error.response?.data || error.message;
  }
};

// ============================================
// ADMIN ONLY ENDPOINTS
// ============================================

/**
 * Get all orders with filters (Admin only)
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (Pending/Contacted/Confirmed/Delivered/Cancelled)
 * @param {string} params.paymentStatus - Filter by payment (Pending/Processing/Paid/Failed/Refunded/Cancelled)
 * @param {string} params.search - Search by order number, customer name, email, phone
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Items per page (default: 20, max: 100)
 * @returns {Promise} { orders: [], pagination: { currentPage, pageSize, totalCount, totalPages } }
 */
export const getAllOrders = async (params = {}) => {
  try {
    const response = await apiInstance.get("/api/Order", { params });
    return response.data.result;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all pending orders (Admin only)
 * @returns {Promise} Array of pending orders
 */
export const getPendingOrders = async () => {
  try {
    const response = await apiInstance.get("/api/Order/pending");
    return response.data.result;
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update order status (Admin only) - CRITICAL
 * @param {number} id - Order ID
 * @param {string} status - New status (Pending/Contacted/Confirmed/Delivered/Cancelled)
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise} Status update result
 *
 * CRITICAL BEHAVIOR:
 * - Pending → Confirmed: Stock is REDUCED (with pessimistic locking)
 * - Confirmed → Other: Stock is RESTORED
 * - Low stock alerts triggered if threshold reached
 */
export const updateOrderStatus = async (id, status, adminNotes = null) => {
  try {
    const dto = { status };
    if (adminNotes) dto.adminNotes = adminNotes;
    const payload = { dto };
    const response = await apiInstance.put(`/api/Order/${id}/status`, payload);
    return response.data.result;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update payment status (Admin only)
 * @param {number} id - Order ID
 * @param {string} paymentStatus - New payment status (Pending/Processing/Paid/Failed/Refunded/Cancelled)
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise} Payment status update result (auto-records paid date)
 */
export const updatePaymentStatus = async (
  id,
  paymentStatus,
  adminNotes = null,
) => {
  try {
    const dto = { paymentStatus };
    if (adminNotes) dto.adminNotes = adminNotes;
    const payload = { dto };
    const response = await apiInstance.put(
      `/api/Order/${id}/payment-status`,
      payload,
    );
    return response.data.result;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error.response?.data || error.message;
  }
};

export default {
  // Public
  createOrder,
  getOrderById,
  // Admin
  getAllOrders,
  getPendingOrders,
  getOrdersByCustomerEmail,
  updateOrderStatus,
  updatePaymentStatus,
};
