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
      <div className="min-h-screen bg-linear-to-b from-[#EFE7D3] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#C8A27B] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#EFE7D3] to-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            We couldn't find the order you're looking for
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 bg-[#4A2F19] text-white px-8 py-3 rounded-lg hover:bg-[#3A2515] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#EFE7D3] to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your order. We'll send you updates via email.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(order.orderDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-4 py-2 rounded-lg border font-semibold ${getStatusColor(order.orderStatus)}`}
              >
                {order.orderStatus}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Name:</strong> {order.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {order.customerEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {order.customerPhone}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h3>
              <p className="text-gray-600">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Status</h3>
            <span
              className={`inline-block px-3 py-1 rounded-lg font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              {order.paymentStatus}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Items
            </h3>
            <div className="space-y-4">
              {order.orderItems &&
                order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product?.imageUrl ? (
                        <img
                          src={getImageUrl(item.product.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.product?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-[#C8A27B] font-bold">
                        Rs. {item.unitPrice.toFixed(2)} each
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-bold text-gray-900">
                        Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-[#C8A27B]">
                    Rs. {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {(order.customerNotes || order.adminNotes) && (
            <div className="mt-6 space-y-3">
              {order.customerNotes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Customer Notes:
                  </p>
                  <p className="text-gray-600">{order.customerNotes}</p>
                </div>
              )}
              {order.adminNotes && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Admin Notes:
                  </p>
                  <p className="text-gray-600">{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 bg-white text-[#4A2F19] px-8 py-3 rounded-lg border-2 border-[#4A2F19] hover:bg-[#EFE7D3] transition-colors font-semibold"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>

        {/* Tracking Info */}
        <div className="mt-8 text-center text-gray-600">
          <Truck className="w-12 h-12 text-[#C8A27B] mx-auto mb-3" />
          <p className="text-sm">
            We'll send you shipping updates via email and SMS
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
