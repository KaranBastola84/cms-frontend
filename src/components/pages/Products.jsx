import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Star,
  Package,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/helpers";
import { useCart } from "../../hooks/useCart";
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
} from "../../services/productService";
import ProductReview from "./ProductReview";

const Products = () => {
  const { addToCart: addToCartContext } = useCart();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Define loadProducts before using it in useEffect
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize,
        isActive: true,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const data = await getAllProducts(params);

      // API returns: { products: [], pagination: { currentPage, pageSize, totalCount, totalPages } }
      if (data && data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalCount || data.products.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load products");
      console.error(error);
      setProducts([]); // Set empty array on error
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedCategory]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [featuredData, categoriesData] = await Promise.all([
        getFeaturedProducts(6),
        getCategories(),
      ]);
      setFeaturedProducts(Array.isArray(featuredData) ? featuredData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load initial data");
      console.error(error);
      setFeaturedProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const handleViewDetails = async (product) => {
    try {
      setSelectedProduct(product); // Show modal immediately with list data
      const fullProduct = await getProductById(product.id);
      setSelectedProduct(fullProduct); // Replace with full detail
    } catch (error) {
      toast.error(error.message || "Failed to load product details");
      console.error(error);
    }
  };

  const addToCart = (product) => {
    if (product.stockQuantity === 0) {
      toast.error("Product is out of stock");
      return;
    }
    const result = addToCartContext(product, 1);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FFF9F0] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-[#C8A27B] fill-current" />
              <h2 className="text-2xl font-bold text-[#4A2F19]">
                Featured Products
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={addToCart}
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="latte-gradient rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-[#4A2F19] text-white rounded-lg hover:bg-[#C8A27B] transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#4A2F19]">Categories</h3>
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#C8A27B] hover:text-[#4A2F19] flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedCategory === category
                        ? "bg-[#4A2F19] text-white border-[#4A2F19]"
                        : "bg-white text-[#4A2F19] border-gray-300 hover:border-[#C8A27B]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#4A2F19]">All Products</h2>
            <p className="text-gray-600">
              {totalItems} {totalItems === 1 ? "product" : "products"} found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A2F19]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-[#4A2F19] text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onViewDetails, onAddToCart, featured }) => {
  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow ${featured ? "border-2 border-[#C8A27B]" : ""}`}
    >
      {/* Product Image */}
      <div
        className="relative h-48 bg-gray-100 overflow-hidden group cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        {product.imageUrl ? (
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {featured && (
          <div className="absolute top-2 left-2 bg-[#C8A27B] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            Featured
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              OUT OF STOCK
            </span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Low Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-semibold text-[#C8A27B] uppercase">
            {product.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#4A2F19] mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[#4A2F19]">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {product.stockQuantity} in stock
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(product)}
              className="px-4 py-2 border-2 border-[#4A2F19] text-[#4A2F19] rounded-lg hover:bg-[#4A2F19] hover:text-white transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className="px-4 py-2 bg-[#C8A27B] text-white rounded-lg hover:bg-[#4A2F19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Detail Modal Component
const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative h-96 bg-gray-100">
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Product Details */}
          <div className="p-8">
            <div className="mb-4">
              <span className="text-sm font-semibold text-[#C8A27B] uppercase">
                {product.category}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#4A2F19] mb-4">
              {product.name}
            </h2>
            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="text-4xl font-bold text-[#4A2F19] mb-2">
                ${product.price.toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-semibold ${isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-green-600"}`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : `${product.stockQuantity} Available`}
                </p>
                {isLowStock && !isOutOfStock && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    Limited Stock
                  </span>
                )}
              </div>
            </div>

            {product.isFeatured && (
              <div className="flex items-center gap-2 mb-6 text-[#C8A27B]">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">Featured Product</span>
              </div>
            )}

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={isOutOfStock}
              className="w-full py-4 bg-[#C8A27B] text-white rounded-lg hover:bg-[#4A2F19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
        {/* Product Reviews Section */}
        <div className="mt-8">
          <hr className="my-6" />
          <ProductReview productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default Products;
