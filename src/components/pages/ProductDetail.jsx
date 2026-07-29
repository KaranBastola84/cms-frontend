import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Star, 
  Package, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  RefreshCw 
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/helpers";
import { useCart } from "../../hooks/useCart";
import { getProductById } from "../../services/productService";
import ProductReview from "./ProductReview";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        toast.error("Failed to load product details");
        console.error(error);
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stockQuantity === 0) {
      toast.error("Product is out of stock");
      return;
    }
    const result = addToCartContext(product, quantity);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] pt-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  if (!product) return null;

  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors mb-8 group uppercase tracking-widest text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Collection
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Product Image Section */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl">
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-[var(--border-strong)]" />
              </div>
            )}
            
            {product.isFeatured && (
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-2 text-[10px] tracking-[0.2em] font-bold uppercase flex items-center gap-2 rounded-lg">
                <Star className="w-3 h-3 text-[var(--brand-primary)] fill-current" />
                Featured Selection
              </div>
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-md flex items-center justify-center z-10">
                <span className="bg-red-500 text-white px-8 py-3 text-sm font-bold tracking-[0.2em] uppercase border border-[var(--border-subtle)] rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Detail Section */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-bold text-[var(--brand-primary)] tracking-[0.3em] uppercase">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading text-[var(--text-primary)] mb-6 font-bold leading-tight uppercase tracking-widest">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-[var(--brand-primary)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[var(--text-secondary)] text-sm uppercase tracking-widest font-bold">
                Professional Grade
              </span>
            </div>

            <div className="text-3xl font-bold text-[var(--text-primary)] mb-8 font-serif italic">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-10 border-l-4 border-[var(--brand-primary)] pl-6">
              {product.description}
            </p>

            <div className="space-y-8 mb-10">
              {/* Stock Status */}
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span className={`text-sm font-bold tracking-widest uppercase ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-green-500'}`}>
                  {isOutOfStock ? 'No Stock Available' : isLowStock ? `Limited Availability: ${product.stockQuantity} Left` : `${product.stockQuantity} In Stock & Ready`}
                </span>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-lg shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors font-bold"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 text-[var(--text-primary)] font-bold border-x border-[var(--border-subtle)] min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-4 py-2 text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-primary py-5 text-sm font-bold tracking-[0.2em] transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase flex items-center justify-center gap-3 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Reserve Selection
              </button>
            </div>

            {/* Product Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[var(--border-subtle)]">
              <div className="flex flex-col items-center text-center p-4 bg-[var(--bg-surface)] shadow-sm rounded-xl border border-[var(--border-subtle)]">
                <ShieldCheck className="w-6 h-6 text-[var(--brand-primary)] mb-3" />
                <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-[0.2em]">Authentic Certification</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-[var(--bg-surface)] shadow-sm rounded-xl border border-[var(--border-subtle)]">
                <Truck className="w-6 h-6 text-[var(--brand-primary)] mb-3" />
                <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-[0.2em]">Secure Global Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-[var(--bg-surface)] shadow-sm rounded-xl border border-[var(--border-subtle)]">
                <RefreshCw className="w-6 h-6 text-[var(--brand-primary)] mb-3" />
                <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-[0.2em]">Premium Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-heading font-bold text-[var(--text-primary)] uppercase tracking-widest">
              Guest Experiences
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-12 shadow-lg">
            <ProductReview productId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
