import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Filter,
  X,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils/helpers";
import {
  getAllOrders,
  getPendingOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../../services/orderService";
import {
  ORDER_STATUSES,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_COLORS,
} from "../../../constants/orderStatus";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
  });

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const data = await getAllOrders(params);

      if (data && data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalCount || data.orders.length);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load orders");
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, paymentFilter]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const [allOrders, pendingOrders] = await Promise.all([
        getAllOrders({ pageSize: 1000 }),
        getPendingOrders(),
      ]);

      const allOrdersList = allOrders?.orders || [];
      const total = allOrdersList.length;
      const pending = pendingOrders?.length || 0;
      const confirmed = allOrdersList.filter(
        (o) => o.status === "Confirmed",
      ).length;
      const delivered = allOrdersList.filter(
        (o) => o.status === "Delivered",
      ).length;

      setStats({ total, pending, confirmed, delivered });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [loadOrders, loadStats]);

  // View order details
  const handleViewOrder = async (orderId) => {
    try {
      const data = await getOrderById(orderId);
      setSelectedOrder(data);
      setShowOrderModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to load order details");
      console.error(error);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus, adminNotes) => {
    try {
      await updateOrderStatus(orderId, newStatus, adminNotes);
      toast.success("Order status updated successfully");
      setShowStatusModal(false);
      setShowOrderModal(false);
      loadOrders();
      loadStats();
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
      console.error(error);
    }
  };

  // Update payment status
  const handleUpdatePayment = async (orderId, newPaymentStatus, adminNotes) => {
    try {
      await updatePaymentStatus(orderId, newPaymentStatus, adminNotes);
      toast.success("Payment status updated successfully");
      setShowPaymentModal(false);
      setShowOrderModal(false);
      loadOrders();
    } catch (error) {
      toast.error(error.message || "Failed to update payment status");
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPaymentFilter("");
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    return (
      ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getPaymentColor = (status) => {
    return PAYMENT_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  };

  const StatCard = ({ icon, label, value, color }) => {
    const IconComponent = icon;

    return (
      <div
        className="bg-white rounded-xl shadow-md p-6 border-l-4"
        style={{ borderColor: color }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <IconComponent className="w-8 h-8" style={{ color }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Management
        </h1>
        <p className="text-gray-600">
          Manage customer orders and track deliveries
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Package}
          label="Total Orders"
          value={stats.total}
          color="#4A2F19"
        />
        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={stats.pending}
          color="#f59e0b"
        />
        <StatCard
          icon={CheckCircle}
          label="Confirmed"
          value={stats.confirmed}
          color="#3b82f6"
        />
        <StatCard
          icon={Truck}
          label="Delivered"
          value={stats.delivered}
          color="#10b981"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, customer name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-[#4A2F19] text-[#4A2F19] rounded-lg hover:bg-[#4A2F19] hover:text-white transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            {(statusFilter || paymentFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              >
                <option value="">All Payment Status</option>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{order.orderNumber || order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.itemCount || 0} items
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">
                        Rs. {order.totalAmount?.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentColor(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-[#4A2F19] hover:text-[#3A2515] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
              orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={() => setShowStatusModal(true)}
          onUpdatePayment={() => setShowPaymentModal(true)}
          getStatusColor={getStatusColor}
          getPaymentColor={getPaymentColor}
        />
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <UpdateStatusModal
          order={selectedOrder}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
        />
      )}

      {/* Update Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <UpdatePaymentModal
          order={selectedOrder}
          onClose={() => setShowPaymentModal(false)}
          onUpdate={handleUpdatePayment}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  getStatusColor,
  getPaymentColor,
}) => {
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber || order.id}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.orderDate).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Payment Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Order Status</h3>
                <button
                  onClick={onUpdateStatus}
                  className="text-sm text-[#4A2F19] hover:underline font-medium"
                >
                  Update
                </button>
              </div>
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Payment Status</h3>
                <button
                  onClick={onUpdatePayment}
                  className="text-sm text-[#4A2F19] hover:underline font-medium"
                >
                  Update
                </button>
              </div>
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getPaymentColor(order.paymentStatus)}`}
              >
                {order.paymentStatus}
              </span>
              {order.paidDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Paid on: {new Date(order.paidDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.customerPhone}</span>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.orderItems &&
                order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {item.product?.imageUrl ? (
                        <img
                          src={getImageUrl(item.product.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Unit Price: Rs. {item.unitPrice?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        Rs. {((item.unitPrice || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-[#4A2F19]">
                  Rs. {order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(order.customerNotes || order.adminNotes) && (
            <div className="space-y-3">
              {order.customerNotes && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Customer Notes
                  </h4>
                  <p className="text-gray-700">{order.customerNotes}</p>
                </div>
              )}
              {order.adminNotes && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Admin Notes
                  </h4>
                  <p className="text-gray-700">{order.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Update Status Modal Component
const UpdateStatusModal = ({ order, onClose, onUpdate }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(order.id, newStatus, adminNotes || null);
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Update Order Status
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              required
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "Confirmed"
                    ? "Confirmed (Will reduce stock)"
                    : status}
                </option>
              ))}
            </select>
            {newStatus === "Confirmed" && order.status !== "Confirmed" && (
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ Confirming this order will reduce product stock quantities
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              placeholder="Add notes about this status change..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3A2515] transition-colors"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Payment Modal Component
const UpdatePaymentModal = ({ order, onClose, onUpdate }) => {
  const [newPaymentStatus, setNewPaymentStatus] = useState(order.paymentStatus);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(order.id, newPaymentStatus, adminNotes || null);
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Update Payment Status
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              required
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {newPaymentStatus === "Paid" && order.paymentStatus !== "Paid" && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Payment date will be automatically recorded
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8A27B] focus:border-transparent"
              placeholder="Add notes about this payment update..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3A2515] transition-colors"
            >
              Update Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderManagement;
