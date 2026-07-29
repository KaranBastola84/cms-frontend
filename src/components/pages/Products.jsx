import React, { useState, useEffect, useCallback, useRef } from "react";
import gsap from "gsap";
import {
  Search,
  ShoppingCart,
  Star,
  Package,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/helpers";
import { useCart } from "../../hooks/useCart";
import {
  getAllProducts,
  getFeaturedProducts,
  getCategories,
} from "../../services/productService";

const Products = () => {
  const navigate = useNavigate();
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

  const containerRef = useRef(null);

  useEffect(() => {
    if (!loading && products.length > 0 && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".product-card-anim",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.1 }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, products]);

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
    <div ref={containerRef} className="min-h-screen bg-[var(--bg-page)] pt-28">
      {/* Page Header */}
      <div className="bg-[var(--brand-primary)] py-16 mb-12 relative overflow-hidden">
        {/* Background glow and styling */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[100%] bg-white/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-widest mb-4">
            Curriculum <span className="text-[var(--brand-secondary)] italic lowercase font-serif">&</span> Programs
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto tracking-wide">
            Explore our world-class specialty coffee courses. Elevate your craft with certified professional training.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-[var(--brand-primary)] fill-current" />
              <h2 className="text-3xl font-heading font-bold text-[var(--text-primary)] uppercase tracking-widest">
                Featured Programs
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
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-8 mb-12 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-[#A0A0A0] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-8 py-4 bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl hover:border-[var(--brand-primary)] transition-colors uppercase tracking-widest text-sm font-bold"
            >
              <Filter className="w-5 h-5 text-[var(--brand-primary)]" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-[var(--text-primary)] uppercase tracking-widest text-sm">Categories</h3>
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] flex items-center gap-1 transition-colors uppercase tracking-wider font-semibold"
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
                    className={`px-5 py-2.5 rounded-full border transition-all text-sm uppercase tracking-wider font-semibold ${
                      selectedCategory === category
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                        : "bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
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
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-heading font-bold text-[var(--text-primary)] uppercase tracking-widest">All Programs</h2>
            <p className="text-[var(--text-secondary)] text-sm uppercase tracking-wider font-semibold">
              {totalItems} {totalItems === 1 ? "program" : "programs"} found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-2xl">
              <Package className="w-20 h-20 text-[var(--border-strong)] mx-auto mb-6" />
              <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">No programs found</p>
              <p className="text-[var(--text-secondary)] mt-3">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="product-card-anim">
                  <ProductCard
                    product={product}
                    onViewDetails={handleViewDetails}
                    onAddToCart={addToCart}
                  />
                </div>
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
              className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                      currentPage === page
                        ? "bg-[var(--brand-primary)] text-white"
                        : "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-3 text-[var(--text-secondary)]">
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
              className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

const ProductCard = ({ product, onViewDetails, onAddToCart, featured }) => {
  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div
      className={`card flex flex-col group h-full hover:-translate-y-1 ${featured ? "border-[var(--brand-primary)] shadow-lg" : ""}`}
    >
      {/* Product Image */}
      <div
        className="relative h-64 bg-[var(--bg-page)] overflow-hidden cursor-pointer"
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
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-primary)] px-3 py-1 text-[10px] tracking-widest font-bold uppercase flex items-center gap-1.5 z-20 rounded-md">
            <Star className="w-3 h-3 text-[var(--brand-primary)] fill-current" />
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
          <div className="absolute top-4 left-4 bg-[#F59E0B] text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase z-20 rounded-md">
            Low Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex-1 flex flex-col relative bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-[var(--brand-primary)] tracking-[0.2em] uppercase">
            {product.category}
          </span>
          <div className="flex text-[var(--brand-primary)]">
            <Star className="w-3 h-3 fill-current mx-0.5" />
            <Star className="w-3 h-3 fill-current mx-0.5" />
            <Star className="w-3 h-3 fill-current mx-0.5" />
            <Star className="w-3 h-3 fill-current mx-0.5" />
            <Star className="w-3 h-3 fill-current mx-0.5" />
          </div>
        </div>
        <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors">
          {product.name}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-6 mt-auto">
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
              {product.stockQuantity} in stock
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onViewDetails(product)}
              className="w-10 h-10 rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] flex items-center justify-center transition-all bg-[var(--bg-page)]"
              title="View Details"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
