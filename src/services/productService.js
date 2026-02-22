import apiInstance from '../config/api';

/**
 * Product Service
 * Handles all product-related API calls for inventory management
 */

// ============================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================

/**
 * Get all products with filters
 * @param {Object} params - Query parameters
 * @param {string} params.category - Filter by category
 * @param {boolean} params.isActive - Filter by active status
 * @param {boolean} params.isFeatured - Filter by featured status
 * @param {boolean} params.lowStock - Filter by low stock
 * @param {string} params.search - Search products
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Items per page (default: 20)
 * @returns {Promise} { products: [], pagination: { currentPage, pageSize, totalCount, totalPages } }
 */
export const getAllProducts = async (params = {}) => {
  try {
    const response = await apiInstance.get('/api/Product', { params });
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get single product details by ID
 * @param {number} id - Product ID
 * @returns {Promise} Product details
 */
export const getProductById = async (id) => {
  try {
    const response = await apiInstance.get(`/api/Product/${id}`);
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of featured products (default: 10, max: 50)
 * @returns {Promise} Array of featured products
 */
export const getFeaturedProducts = async (limit = 10) => {
  try {
    const response = await apiInstance.get('/api/Product/featured', {
      params: { limit }
    });
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get products by category
 * @param {string} category - Category name
 * @param {Object} params - Query parameters (page, pageSize)
 * @returns {Promise} { category, products: [], pagination: {} }
 */
export const getProductsByCategory = async (category, params = {}) => {
  try {
    const response = await apiInstance.get(`/api/Product/category/${category}`, { params });
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all available categories
 * @returns {Promise} Array of category strings
 */
export const getCategories = async () => {
  try {
    const response = await apiInstance.get('/api/Product/categories');
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error.response?.data || error.message;
  }
};

// ============================================
// ADMIN ONLY ENDPOINTS
// ============================================

/**
 * Create new product (Admin only)
 * @param {Object} productData - Product information
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price
 * @param {number} productData.stockQuantity - Stock quantity
 * @param {number} productData.lowStockThreshold - Low stock alert threshold
 * @param {string} productData.category - Product category
 * @param {boolean} productData.isActive - Is product active
 * @param {boolean} productData.isFeatured - Is product featured
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
  try {
    const response = await apiInstance.post('/api/Product', productData);
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error creating product:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update product details (Admin only)
 * @param {number} id - Product ID
 * @param {Object} productData - Updated product information
 * @returns {Promise} Updated product
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiInstance.put(`/api/Product/${id}`, productData);
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update product stock quantity (Admin only)
 * @param {number} id - Product ID
 * @param {number} stockQuantity - New stock quantity
 * @returns {Promise} Updated product
 */
export const updateProductStock = async (id, stockQuantity) => {
  try {
    const response = await apiInstance.put(`/api/Product/${id}/stock`, { stockQuantity });
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete product (Admin only)
 * ⚠️ Prevents deletion if product has orders
 * @param {number} id - Product ID
 * @returns {Promise} Deletion result
 */
export const deleteProduct = async (id) => {
  try {
    const response = await apiInstance.delete(`/api/Product/${id}`);
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Upload product image (Admin only)
 * Max 5MB, supports: .jpg, .jpeg, .png, .gif, .webp
 * Auto-deletes old image
 * @param {number} id - Product ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} Upload result with image URL
 */
export const uploadProductImage = async (id, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiInstance.post(`/api/Product/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete product image (Admin only)
 * @param {number} id - Product ID
 * @returns {Promise} Deletion result
 */
export const deleteProductImage = async (id) => {
  try {
    const response = await apiInstance.delete(`/api/Product/${id}/image`);
    return response.data.data; // Extract data from { success, data, message }
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error.response?.data || error.message;
  }
};

export default {
  // Public
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  // Admin
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
};
