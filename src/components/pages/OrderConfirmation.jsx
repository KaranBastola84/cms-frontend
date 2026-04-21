import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowLeft,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/helpers";
import { getOrderById } from "../../services/orderService";
import {
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS_LIGHT,
} from "../../constants/orderStatus";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      toast.error("Failed to load order details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const getStatusColor = (status) => {
    return ORDER_STATUS_COLORS[status] || "";
  };

  const getPaymentStatusColor = (status) => {
    return PAYMENT_STATUS_COLORS_LIGHT[status] || "";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-100px)] bg-[#0F0F0F] flex items-center justify-center pt-24 pb-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#C6A36A] animate-spin mx-auto mb-4" />
          <p className="text-[#E0E0E0] font-light tracking-wide uppercase">Securing order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-100px)] bg-[#0F0F0F] flex items-center justify-center pt-24 pb-12">
        <div className="text-center luxury-card bg-[#1A1A1A] p-12 border-[#ffffff15] max-w-md w-full mx-4">
          <Package className="w-24 h-24 text-[#333333] mx-auto mb-6" />
          <h2 className="text-3xl font-heading font-normal text-white mb-4 uppercase tracking-widest">
            Order Not Found
          </h2>
          <p className="text-[#808080] mb-8 font-light">
            We couldn't locate the order details you requested.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="btn-gold-primary inline-flex items-center justify-center gap-2 w-full"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10 fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-[#1A1A1A] p-5 rounded-full border border-[#C6A36A]/30 shadow-[0_0_30px_rgba(198,163,106,0.15)]">
              <CheckCircle className="w-16 h-16 text-[#C6A36A]" />
            </div>
          </div>
          <h1 className="text-4xl font-heading font-normal text-white mb-4 uppercase tracking-widest">
            Order Secured
          </h1>
          <p className="text-[#E0E0E0] text-lg font-light tracking-wide">
            Thank you for your acquisition. Status updates will follow via email.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="luxury-card bg-[#1A1A1A] p-8 md:p-10 mb-8 border-[#ffffff10] fade-in transform transition-transform duration-500 hover:scale-[1.01]">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center border-b border-[#ffffff10] pb-6 mb-6 gap-4">
            <div>
              <p className="text-[10px] text-[#C6A36A] uppercase tracking-[0.2em] mb-1 font-bold">Acquisition Ref</p>
              <h2 className="text-2xl font-heading font-normal text-white mb-2 uppercase tracking-wider">
                #{order.id}
              </h2>
              <div className="flex items-center gap-2 text-[#808080] text-sm">
                <Calendar className="w-4 h-4 text-[#C6A36A]" />
                <span className="font-light tracking-wider uppercase text-[10px]">
                  {new Date(order.orderDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}
              >
                {order.orderStatus}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-[#ffffff10]">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <Package className="w-4 h-4 text-[#C6A36A]" />
                Client Details
              </h3>
              <div className="space-y-3 bg-[#0F0F0F] p-5 rounded-xl border border-[#ffffff05]">
                <p className="flex justify-between items-center border-b border-[#ffffff10] pb-2">
                  <span className="text-[10px] text-[#808080] uppercase tracking-widest font-bold">Name</span>
                  <span className="text-[#E0E0E0] font-light text-sm">{order.customerName}</span>
                </p>
                <p className="flex justify-between items-center border-b border-[#ffffff10] pb-2">
                  <span className="text-[10px] text-[#808080] uppercase tracking-widest font-bold">Email</span>
                  <span className="text-[#E0E0E0] font-light text-sm">{order.customerEmail}</span>
                </p>
                <p className="flex justify-between items-center">
                  <span className="text-[10px] text-[#808080] uppercase tracking-widest font-bold">Phone</span>
                  <span className="text-[#E0E0E0] font-light text-sm">{order.customerPhone}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <MapPin className="w-4 h-4 text-[#C6A36A]" />
                Dispatch Location
              </h3>
              <div className="bg-[#0F0F0F] p-5 rounded-xl border border-[#ffffff05] h-[calc(100%-2rem)] flex items-center">
                <p className="text-[#CCCCCC] font-light text-sm leading-relaxed">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-8 pb-8 border-b border-[#ffffff10] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Financial Status</h3>
            <span
              className={`inline-block px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              {order.paymentStatus}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest mb-4">
              <ShoppingBag className="w-4 h-4 text-[#C6A36A]" />
              Acquisition Portfolio
            </h3>
            <div className="space-y-4">
              {order.orderItems &&
                order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-5 p-4 bg-[#0F0F0F] border border-[#ffffff05] rounded-xl hover:border-[#ffffff15] transition-colors"
                  >
                    <div className="w-24 h-24 bg-[#1A1A1A] rounded-lg overflow-hidden shrink-0 border border-[#ffffff10]">
                      {item.product?.imageUrl ? (
                        <img
                          src={getImageUrl(item.product.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-[#333333]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-heading font-normal text-white text-lg tracking-wider uppercase mb-1">
                        {item.product?.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <span className="text-[#808080] font-light">Qty: <span className="text-[#E0E0E0] font-medium">{item.quantity}</span></span>
                        <span className="w-1 h-1 rounded-full bg-[#333333]"></span>
                        <span className="text-[#C6A36A] font-bold">
                          Rs. {item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-[#ffffff10] pt-4 sm:pt-0 sm:pl-5 mt-2 sm:mt-0">
                      <p className="text-[10px] text-[#808080] uppercase tracking-widest font-bold mb-1">Total</p>
                      <p className="font-heading font-normal text-white text-xl">
                        Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-[#0F0F0F] rounded-xl p-6 border border-[#C6A36A]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A36A]/5 rounded-bl-full pointer-events-none"></div>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-[#CCCCCC] font-light py-2">
                <span className="text-[10px] uppercase tracking-widest font-bold">Subtotal Base</span>
                <span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#ffffff15] pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-white">Final Valuation</span>
                  <span className="text-3xl font-heading font-normal text-[#C6A36A]">
                    Rs. {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {(order.customerNotes || order.adminNotes) && (
            <div className="mt-8 space-y-4">
              {order.customerNotes && (
                <div className="p-5 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Client Remark:
                  </p>
                  <p className="text-[#E0E0E0] font-light text-sm italic">"{order.customerNotes}"</p>
                </div>
              )}
              {order.adminNotes && (
                <div className="p-5 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Administrative Note:
                  </p>
                  <p className="text-[#E0E0E0] font-light text-sm italic">"{order.adminNotes}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={() => navigate("/products")}
            className="btn-gold-outline inline-flex items-center gap-2 px-8 py-3 rounded-none uppercase tracking-widest text-xs font-bold w-full sm:w-auto text-center justify-center transform hover:-translate-y-1 transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Collection
          </button>
        </div>

        {/* Tracking Info */}
        <div className="mt-12 text-center text-[#808080]">
          <Truck className="w-10 h-10 text-[#333333] mx-auto mb-4" />
          <p className="text-[10px] uppercase tracking-widest font-bold">
            Dispatch updates secured via encrypted ledger
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
