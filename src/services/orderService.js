import apiInstance from '../config/api';

/**
 * Order Service
 * Handles all order-related API calls for sales management
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Create new order (Guest checkout)
 * @param {Object} orderData - Order information
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.customerEmail - Customer email
 * @param {string} orderData.customerPhone - Customer phone number
 * @param {string} orderData.shippingAddress - Shipping address
 * @param {Array} orderData.items - Array of order items
 * @param {number} orderData.items[].productId - Product ID
 * @param {number} orderData.items[].quantity - Quantity ordered
 * @param {number} orderData.items[].unitPrice - Price at time of order
 * @param {string} orderData.paymentMethod - Payment method (Cash/Card/Online)
 * @param {string} orderData.notes - Optional order notes
 * @returns {Promise} Created order with order ID
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiInstance.post('/api/Order', orderData);
    return response.data.result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get order details by ID (Public - for order confirmation)
 * @param {number} id - Order ID
 * @returns {Promise} Order details with items
 */
export const getOrderById = async (id) => {
  try {
    const response = await apiInstance.get(`/api/Order/${id}`);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error.response?.data || error.message;
  }
};

// ============================================
// ADMIN ONLY ENDPOINTS
// ============================================

/**
 * Get all orders with filters (Admin only)
 * @param {Object} params - Query parameters
 * @param {string} params.orderStatus - Filter by status (Pending/Processing/Shipped/Delivered/Cancelled)
 * @param {string} params.paymentStatus - Filter by payment (Pending/Paid/Refunded)
 * @param {string} params.search - Search by customer name, email, or order ID
 * @param {string} params.startDate - Filter orders from date (ISO 8601)
 * @param {string} params.endDate - Filter orders to date (ISO 8601)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Items per page (default: 20)
 * @returns {Promise} { orders: [], pagination: { currentPage, pageSize, totalCount, totalPages } }
 */
export const getAllOrders = async (params = {}) => {
  try {
    const response = await apiInstance.get('/api/Order', { params });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update order status (Admin only)
 * @param {number} id - Order ID
 * @param {string} orderStatus - New status (Pending/Processing/Shipped/Delivered/Cancelled)
 * @returns {Promise} Updated order
 */
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    const response = await apiInstance.put(`/api/Order/${id}/status`, { orderStatus });
    return response.data.result;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update payment status (Admin only)
 * @param {number} id - Order ID
 * @param {string} paymentStatus - New payment status (Pending/Paid/Refunded)
 * @returns {Promise} Updated order
 */
export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const response = await apiInstance.put(`/api/Order/${id}/payment-status`, { paymentStatus });
    return response.data.result;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cancel order (Admin only)
 * Updates status to Cancelled and restores product stock
 * @param {number} id - Order ID
 * @param {string} cancellationReason - Reason for cancellation
 * @returns {Promise} Updated order
 */
export const cancelOrder = async (id, cancellationReason) => {
  try {
    const response = await apiInstance.put(`/api/Order/${id}/cancel`, { cancellationReason });
    return response.data.result;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get order statistics (Admin only)
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date for stats
 * @param {string} params.endDate - End date for stats
 * @returns {Promise} Order statistics
 */
export const getOrderStats = async (params = {}) => {
  try {
    const response = await apiInstance.get('/api/Order/stats', { params });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error.response?.data || error.message;
  }
};

export default {
  // Public
  createOrder,
  getOrderById,
  // Admin
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
};
