import apiInstance from "../config/api";

/**
 * Product Review Service
 * Handles all product review-related API calls
 */

const productReviewService = {
  /**
   * Submit a new product review
   * @param {Object} reviewData
   * @returns {Promise<Object>}
   */
  submitReview: async (reviewData) => {
    const response = await apiInstance.post("/api/ProductReview", reviewData);
    return response.data.result;
  },

  /**
   * Get all product reviews
   * @returns {Promise<Array>}
   */
  getAllReviews: async () => {
    const response = await apiInstance.get("/api/ProductReview");
    return response.data.result;
  },

  /**
   * Get reviews for a specific product
   * @param {number} productId
   * @returns {Promise<Array>}
   */
  getReviewsByProduct: async (productId) => {
    const response = await apiInstance.get(
      `/api/ProductReview/product/${productId}`,
    );
    return response.data.result;
  },

  /**
   * Get pending reviews (for moderation)
   * @returns {Promise<Array>}
   */
  getPendingReviews: async () => {
    const response = await apiInstance.get("/api/ProductReview/pending");
    return response.data.result;
  },

  /**
   * Get a review by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  getReviewById: async (id) => {
    const response = await apiInstance.get(`/api/ProductReview/${id}`);
    return response.data.result;
  },

  /**
   * Delete a review by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  deleteReview: async (id) => {
    const response = await apiInstance.delete(`/api/ProductReview/${id}`);
    return response.data.result;
  },

  /**
   * Approve a review by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  approveReview: async (id) => {
    const response = await apiInstance.put(`/api/ProductReview/${id}/approve`);
    return response.data.result;
  },

  /**
   * Reject a review by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  rejectReview: async (id) => {
    const response = await apiInstance.put(`/api/ProductReview/${id}/reject`);
    return response.data.result;
  },
};

export default productReviewService;
