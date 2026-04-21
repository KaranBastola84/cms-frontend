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
      <div className="min-h-screen bg-[#0F0F0F] pt-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6A36A]"></div>
      </div>
    );
  }

  if (!product) return null;

  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#C6A36A] transition-colors mb-8 group uppercase tracking-widest text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Collection
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Product Image Section */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A] border border-[#ffffff05] shadow-2xl">
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-[#333333]" />
              </div>
            )}
            
            {product.isFeatured && (
              <div className="absolute top-6 right-6 bg-[#0F0F0F]/80 backdrop-blur-md border border-[#C6A36A]/30 text-white px-4 py-2 text-[10px] tracking-[0.2em] font-bold uppercase flex items-center gap-2">
                <Star className="w-3 h-3 text-[#C6A36A] fill-current" />
                Featured Selection
              </div>
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-[#0F0F0F]/80 backdrop-blur-md flex items-center justify-center z-10">
                <span className="bg-[#C62828] text-white px-8 py-3 text-sm font-bold tracking-[0.2em] uppercase border border-[#ffffff10]">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Detail Section */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-bold text-[#C6A36A] tracking-[0.3em] uppercase">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading text-white mb-6 leading-tight uppercase tracking-widest">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-[#C6A36A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[#A0A0A0] text-sm uppercase tracking-widest font-medium">
                Professional Grade
              </span>
            </div>

            <div className="text-3xl font-bold text-white mb-8 font-serif italic">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-[#E0E0E0] text-lg font-light leading-relaxed mb-10 border-l-2 border-[#C6A36A]/30 pl-6 italic">
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
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center border border-[#ffffff10] bg-[#1A1A1A] rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-white hover:text-[#C6A36A] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 text-white font-bold border-x border-[#ffffff10] min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-4 py-2 text-white hover:text-[#C6A36A] transition-colors"
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
                className="flex-1 btn-gold-primary py-5 text-sm font-black tracking-[0.2em] transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Reserve Selection
              </button>
            </div>

            {/* Product Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#ffffff05]">
              <div className="flex flex-col items-center text-center p-4 bg-[#1A1A1A]/30 rounded-xl border border-[#ffffff05]">
                <ShieldCheck className="w-6 h-6 text-[#C6A36A] mb-3" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Authentic Certification</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-[#1A1A1A]/30 rounded-xl border border-[#ffffff05]">
                <Truck className="w-6 h-6 text-[#C6A36A] mb-3" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Secure Global Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-[#1A1A1A]/30 rounded-xl border border-[#ffffff05]">
                <RefreshCw className="w-6 h-6 text-[#C6A36A] mb-3" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Premium Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-heading text-white uppercase tracking-widest">
              Guest Experiences
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#C6A36A]/50 to-transparent" />
          </div>
          <div className="bg-[#1A1A1A] border border-[#ffffff05] rounded-3xl p-8 md:p-12 shadow-inner">
            <ProductReview productId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
