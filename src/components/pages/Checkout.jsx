import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../hooks/useCart";
import { getImageUrl } from "../../utils/helpers";
import { createOrder } from "../../services/orderService";

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    customerNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const subtotal = getSubtotal();
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 0 ? 150 : 0; // Flat shipping rate
  const total = subtotal + tax + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (productId, newQuantity, maxStock) => {
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }
    if (newQuantity < 1) {
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate form
    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.deliveryAddress
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Prepare order data to match API specification
    const orderData = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      deliveryAddress: formData.deliveryAddress,
      customerNotes: formData.customerNotes || "",
      orderItems: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    setIsSubmitting(true);
    try {
      const result = await createOrder(orderData);
      toast.success(result.message || "Order placed successfully!");
      clearCart();
      // Removed navigation to order confirmation page
    } catch (error) {
      const errorMsg =
        error.message || "Failed to place order. Please try again.";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] py-20 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center py-24 luxury-card bg-[#1A1A1A]">
            <ShoppingCart className="w-24 h-24 text-[#333333] mx-auto mb-8" strokeWidth={1} />
            <h2 className="text-3xl font-heading font-normal text-white mb-4 uppercase tracking-widest">
              Your Cart is Empty
            </h2>
            <p className="text-[#808080] mb-10 font-light text-lg">
              Begin your journey to discover our premium programs and equipment.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn-gold-primary"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-[#808080] hover:text-[#C6A36A] mb-8 transition-colors text-sm uppercase tracking-widest font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Store
          </button>
          <h1 className="text-4xl md:text-5xl font-heading text-white uppercase tracking-widest">Secure Checkout</h1>
          <p className="text-[#E0E0E0] mt-3 font-light text-lg">
            {getItemCount()} items in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="luxury-card p-8 bg-[#1A1A1A]">
              <h2 className="text-2xl font-heading text-white mb-8 flex items-center gap-3 uppercase tracking-widest border-b border-[#ffffff10] pb-6">
                <ShoppingCart className="w-6 h-6 text-[#C6A36A]" />
                Cart Items
              </h2>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-6 p-6 bg-[#0F0F0F] border border-[#ffffff10] rounded-xl hover:border-[#C6A36A]/50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 bg-[#1A1A1A] rounded-lg overflow-hidden shrink-0 border border-[#ffffff05]">
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-[#333333]" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-heading text-lg text-white truncate mb-2 group-hover:text-[#C6A36A] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[#C6A36A] font-medium text-lg mb-2">
                        ${item.price.toFixed(2)}
                      </p>
                      {item.stockQuantity < 10 && (
                        <p className="text-[#C6A36A] text-xs uppercase tracking-wider font-semibold opacity-80">
                          Limited Availability: {item.stockQuantity} remaining
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-[#ffffff10] pt-4 sm:pt-0 sm:pl-6">
                      <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#ffffff15] rounded-lg p-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity - 1,
                              item.stockQuantity,
                            )
                          }
                          className="p-1 hover:bg-[#333333] hover:text-[#C6A36A] text-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-semibold text-white min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity + 1,
                              item.stockQuantity,
                            )
                          }
                          className="p-1 hover:bg-[#333333] hover:text-[#C6A36A] text-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          disabled={item.quantity >= item.stockQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-[#808080] uppercase tracking-widest mb-1">Subtotal</p>
                          <p className="font-bold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="p-2 text-[#808080] hover:text-[#C62828] hover:bg-[#C62828]/10 rounded-lg transition-colors border border-transparent hover:border-[#C62828]/30"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="luxury-card p-8 bg-[#1A1A1A]">
              <h2 className="text-2xl font-heading text-white mb-8 border-b border-[#ffffff10] pb-6 uppercase tracking-widest">
                Billing Details
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-widest mb-3">
                    Full Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="luxury-input"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-widest mb-3">
                      Email Address <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="luxury-input"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-widest mb-3">
                      Phone Number <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="luxury-input"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-widest mb-3">
                    Delivery Address <span className="text-[#C62828]">*</span>
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="luxury-input resize-none"
                    placeholder="124 Specialty Ave, Coffee District, Portland..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-widest mb-3">
                    Order Notes <span className="text-[#808080] font-normal lowercase tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleInputChange}
                    rows={2}
                    className="luxury-input resize-none"
                    placeholder="Special instructions for the courier..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="luxury-card p-8 bg-[#1A1A1A] sticky top-28">
              <h2 className="text-2xl font-heading text-white mb-8 border-b border-[#ffffff10] pb-6 uppercase tracking-widest">
                Order Summary
              </h2>

              {/* Totals */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#ffffff10] pt-6 mt-6">
                  <div className="flex justify-between text-2xl font-heading font-bold text-white">
                    <span>Total</span>
                    <span className="text-[#C6A36A]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="btn-gold-primary w-full shadow-[0_4px_20px_rgba(198,163,106,0.15)] disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? "Processing..." : "Complete Purchase"}
              </button>

              <p className="text-xs text-[#808080] text-center mt-6 uppercase tracking-widest leading-relaxed">
                By completing your purchase, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
