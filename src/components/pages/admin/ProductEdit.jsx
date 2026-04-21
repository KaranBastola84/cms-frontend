import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils/helpers";
import {
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "../../../services/productService";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    lowStockThreshold: "5",
    category: "",
    isActive: true,
    isFeatured: false,
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const product = await getProductById(id);
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stockQuantity: product.stockQuantity,
            lowStockThreshold: product.lowStockThreshold,
            category: product.category,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
          });
          setImagePreview(product.imageUrl ? getImageUrl(product.imageUrl) : null);
        } catch (error) {
          toast.error("Failed to load product");
          navigate("/admin/products");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate, loadCategories]);

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

  const handleDeleteImage = async () => {
    if (!isEdit) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    try {
      await deleteProductImage(id);
      setImagePreview(null);
      setImageFile(null);
      toast.success("Image removed");
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let result;
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      };

      if (isEdit) {
        // Exclude stockQuantity from update FIELDS if needed by API, 
        // but normally PUT handles it. Based on previous code, stock updates 
        // often go through a separate endpoint, but let's stick to updateProduct first.
        result = await updateProduct(id, productData);
        toast.success("Product updated successfully");
      } else {
        result = await createProduct(productData);
        toast.success("Product created successfully");
      }

      const productId = result?.id || id;
      if (imageFile && productId) {
        await uploadProductImage(productId, imageFile);
      }

      navigate("/admin/products");
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6A36A]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#C6A36A] transition-colors mb-2 uppercase tracking-widest text-[10px] font-bold"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Inventory
          </button>
          <h1 className="text-3xl font-heading text-white uppercase tracking-widest">
            {isEdit ? "Refine Product" : "New Selection"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2.5 bg-transparent border border-[#ffffff10] text-[#E0E0E0] hover:bg-[#ffffff05] rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#C6A36A] text-[#0F0F0F] hover:bg-[#D4B785] rounded-lg transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-[#0F0F0F] border-t-transparent animate-spin rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar - Image & Status */}
        <div className="space-y-8">
          {/* Image Upload */}
          <div className="bg-[#1A1A1A] border border-[#ffffff05] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Product Media</h3>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0F0F0F] border border-[#ffffff10] group mb-4">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <label htmlFor="image-upload" className="p-3 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer backdrop-blur-sm transition-all">
                      <Upload className="w-5 h-5 text-white" />
                    </label>
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-full backdrop-blur-sm transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </>
              ) : (
                <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#ffffff05] transition-colors gap-3">
                  <div className="p-4 rounded-full bg-[#ffffff05]">
                    <ImageIcon className="w-8 h-8 text-[#A0A0A0]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Upload Portrait</span>
                </label>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
            </div>
            <p className="text-[10px] text-[#666666] text-center leading-relaxed">
              Recommended: 1000x1000px JPG or PNG.<br/>Max file size 5MB.
            </p>
          </div>

          {/* Visibility & Attributes */}
          <div className="bg-[#1A1A1A] border border-[#ffffff05] rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Attributes</h3>
            
            <div className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-xl border border-[#ffffff05]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Active</span>
                <span className="text-[10px] text-[#A0A0A0]">Visible to guests</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6A36A]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-xl border border-[#ffffff05]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Featured</span>
                <span className="text-[10px] text-[#A0A0A0]">Highlight on store</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6A36A]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <div className="bg-[#1A1A1A] border border-[#ffffff05] rounded-2xl p-8 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Package className="w-4 h-4 text-[#C6A36A]" />
              General Information
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product title..."
                  className="luxury-input !bg-[#0F0F0F] !border-[#ffffff10] !py-4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Description</label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the unique qualities and origin..."
                  className="luxury-input !bg-[#0F0F0F] !border-[#ffffff10] !py-4 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Category</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      list="categories-list"
                      placeholder="Select or enter new..."
                      className="luxury-input !bg-[#0F0F0F] !border-[#ffffff10] !py-4"
                    />
                    <datalist id="categories-list">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#CCCCCC] font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="luxury-input !bg-[#0F0F0F] !border-[#ffffff10] !py-4 !pl-10"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Inventory Management */}
          <div className="bg-[#1A1A1A] border border-[#ffffff05] rounded-2xl p-8 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Package className="w-4 h-4 text-[#C6A36A]" />
              Inventory & Fulfillment
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Starting Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="Amount in units"
                  className="luxury-input !bg-[#0F0F0F] !border-[#ffffff10] !py-4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  placeholder="Notify when below..."
                  className="luxury-input !bg-[#0F0F0F] !border-[#ffffff10] !py-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
