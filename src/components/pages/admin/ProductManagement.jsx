import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Upload,
  X,
  Save,
  AlertTriangle,
  Image as ImageIcon,
  TrendingUp,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils/helpers";
import {
  getAllProducts,
  getCategories,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} from "../../../services/productService";
import { useNavigate } from "react-router-dom";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Stats (server-side totals)
  const [stats, setStats] = useState({
    active: 0,
    featured: 0,
    lowStock: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    lowStockThreshold: "",
    category: "",
    isActive: true,
    isFeatured: false,
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const data = await getAllProducts(params);

      // Ensure data exists and has the correct structure
      if (data && data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalCount || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
      setProducts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [activeData, featuredData, lowStockData] = await Promise.all([
        getAllProducts({ isActive: true, pageSize: 1 }),
        getAllProducts({ isFeatured: true, pageSize: 1 }),
        getAllProducts({ lowStock: true, pageSize: 1 }),
      ]);
      setStats({
        active: activeData?.pagination?.totalCount || 0,
        featured: featuredData?.pagination?.totalCount || 0,
        lowStock: lowStockData?.pagination?.totalCount || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [loadCategories, loadStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const openCreateModal = () => {
    navigate("/admin/products/new");
  };

  const openEditModal = (product) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handled in dedicated page now
  };

  const handleDeleteImage = async (productId) => {
    try {
      await deleteProductImage(productId);
      toast.success("Image deleted successfully");
      loadProducts();
    } catch (error) {
      toast.error("Failed to delete image");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      toast.success("Product deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingProduct(null);
      loadProducts();
      loadStats();
    } catch (error) {
      toast.error(
        error.message ||
          "Cannot delete product that has orders. Consider deactivating it instead.",
      );
      console.error(error);
    }
  };

  const handleStockUpdate = async (productId, currentStock) => {
    const newStock = prompt(
      `Update stock for product (Current: ${currentStock}):`,
      currentStock,
    );
    if (newStock !== null && !isNaN(newStock)) {
      try {
        await updateProductStock(productId, parseInt(newStock));
        toast.success("Stock updated successfully");
        loadProducts();
        loadStats();
      } catch (error) {
        toast.error("Failed to update stock");
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4A2F19] mb-2">
          Product Management
        </h1>
        <p className="text-gray-600">
          Manage your inventory and product catalog
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={Package}
          label="Total Products"
          value={totalItems}
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Products"
          value={stats.active}
          color="bg-green-500"
        />
        <StatCard
          icon={Star}
          label="Featured"
          value={stats.featured}
          color="bg-yellow-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.lowStock}
          color="bg-red-500"
        />
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A27B]"
              />
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A27B]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Add Product Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#C8A27B] transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A2F19]"></div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(products || []).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {product.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-yellow-600">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleStockUpdate(product.id, product.stockQuantity)
                        }
                        className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                      >
                        <span
                          className={`font-semibold ${
                            product.isLowStock
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                        {product.isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(product);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
              products
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          product={deletingProduct}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Stat Card Component
// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Delete Confirmation Modal
const DeleteConfirmModal = ({ product, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
            <p className="text-gray-600 text-sm">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{product?.name}</strong>?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
