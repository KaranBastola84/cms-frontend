export const ORDER_STATUSES = [
  "Pending",
  "Contacted",
  "Confirmed",
  "Delivered",
  "Cancelled",
];

export const ORDER_STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Contacted: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Delivered: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

export const PAYMENT_STATUSES = [
  "Pending",
  "Processing",
  "Paid",
  "Failed",
  "Refunded",
  "Cancelled",
];

export const PAYMENT_STATUS_COLORS = {
  Pending: "bg-orange-100 text-orange-800",
  Processing: "bg-blue-100 text-blue-800",
  Paid: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
  Refunded: "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
};

export const PAYMENT_STATUS_COLORS_LIGHT = {
  Pending: "text-orange-600 bg-orange-50",
  Processing: "text-blue-600 bg-blue-50",
  Paid: "text-green-600 bg-green-50",
  Failed: "text-red-600 bg-red-50",
  Refunded: "text-gray-600 bg-gray-50",
  Cancelled: "text-red-600 bg-red-50",
};
