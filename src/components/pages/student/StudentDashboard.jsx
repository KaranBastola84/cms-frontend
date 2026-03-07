import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  CreditCard,
  FileText,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  BookOpen,
  Receipt,
} from "lucide-react";
import { getStudentPaymentPlans } from "../../../services/paymentPlanService";
import {
  getStudentReceipts,
  downloadReceipt,
} from "../../../services/receiptService";
import { getStudentPayments } from "../../../services/stripePaymentService";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";

function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedTab, setSelectedTab] = useState("overview"); // overview, plans, receipts, payments

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, receiptsData, paymentsData] = await Promise.all([
        getStudentPaymentPlans(user.userId).catch(() => []),
        getStudentReceipts(user.userId).catch(() => []),
        getStudentPayments(user.userId).catch(() => []),
      ]);

      setPaymentPlans(plansData || []);
      setReceipts(receiptsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load some data");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (user?.userId) {
      fetchStudentData();
    }
  }, [fetchStudentData, user?.userId]);

  const handleDownloadReceipt = async (receiptId, receiptNumber) => {
    try {
      await downloadReceipt(receiptId, `${receiptNumber}.pdf`);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      toast.error("Failed to download receipt");
      console.error(error);
    }
  };

  // Calculate summary statistics
  const totalDue = paymentPlans.reduce(
    (sum, plan) => sum + (plan.balanceAmount || 0),
    0,
  );
  const totalPaid = paymentPlans.reduce(
    (sum, plan) => sum + (plan.paidAmount || 0),
    0,
  );
  const activePlans = paymentPlans.filter(
    (plan) => plan.status === "Active",
  ).length;
  const overdueInstallments = paymentPlans.reduce(
    (sum, plan) => sum + (plan.overdueInstallments || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#4A2F19]">
          Welcome back, {user?.name || "Student"}!
        </h1>
        <p className="text-[#6B4423] mt-1">
          Manage your courses, payments, and receipts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#C8A27B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B4423]">Total Due</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ${totalDue.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#C8A27B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B4423]">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#C8A27B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B4423]">Active Plans</p>
              <p className="text-2xl font-bold text-[#4A2F19] mt-1">
                {activePlans}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#C8A27B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B4423]">Overdue</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {overdueInstallments}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#C8A27B]/20">
        <nav className="flex gap-6">
          {[
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "plans", label: "Payment Plans", icon: CreditCard },
            { id: "receipts", label: "Receipts", icon: Receipt },
            { id: "payments", label: "Payment History", icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? "border-[#C8A27B] text-[#4A2F19] font-medium"
                  : "border-transparent text-[#6B4423] hover:text-[#4A2F19]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Active Payment Plans */}
            <div className="bg-white rounded-lg shadow-sm border border-[#C8A27B]/20 p-6">
              <h2 className="text-lg font-semibold text-[#4A2F19] mb-4">
                Active Payment Plans
              </h2>
              {paymentPlans.filter((plan) => plan.status === "Active")
                .length === 0 ? (
                <p className="text-[#6B4423]">No active payment plans</p>
              ) : (
                <div className="space-y-4">
                  {paymentPlans
                    .filter((plan) => plan.status === "Active")
                    .map((plan) => (
                      <div
                        key={plan.paymentPlanId}
                        className="border border-[#C8A27B]/20 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-[#4A2F19]">
                              {plan.courseName}
                            </h3>
                            <p className="text-sm text-[#6B4423]">
                              {plan.paidInstallments || 0} of{" "}
                              {plan.numberOfInstallments} installments paid
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#4A2F19]">
                              ${plan.balanceAmount?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-[#6B4423]">remaining</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-[#C8A27B] h-2 rounded-full"
                            style={{
                              width: `${((plan.paidInstallments || 0) / plan.numberOfInstallments) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Recent Receipts */}
            <div className="bg-white rounded-lg shadow-sm border border-[#C8A27B]/20 p-6">
              <h2 className="text-lg font-semibold text-[#4A2F19] mb-4">
                Recent Receipts
              </h2>
              {receipts.length === 0 ? (
                <p className="text-[#6B4423]">No receipts available</p>
              ) : (
                <div className="space-y-3">
                  {receipts.slice(0, 3).map((receipt) => (
                    <div
                      key={receipt.receiptId}
                      className="flex justify-between items-center border-b border-[#C8A27B]/10 pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-[#4A2F19]">
                          {receipt.receiptNumber}
                        </p>
                        <p className="text-sm text-[#6B4423]">
                          {new Date(receipt.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#4A2F19]">
                          ${receipt.amount?.toLocaleString()}
                        </p>
                        <button
                          onClick={() =>
                            handleDownloadReceipt(
                              receipt.receiptId,
                              receipt.receiptNumber,
                            )
                          }
                          className="text-[#C8A27B] hover:text-[#4A2F19]"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Plans Tab */}
        {selectedTab === "plans" && (
          <div className="bg-white rounded-lg shadow-sm border border-[#C8A27B]/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EFE7D3]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Installments
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8A27B]/20">
                  {paymentPlans.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-[#6B4423]"
                      >
                        No payment plans found
                      </td>
                    </tr>
                  ) : (
                    paymentPlans.map((plan) => (
                      <tr key={plan.paymentPlanId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-[#4A2F19]">
                          {plan.courseName}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4A2F19] font-medium">
                          ${plan.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600">
                          ${plan.paidAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 font-medium">
                          ${plan.balanceAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              plan.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : plan.status === "Completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {plan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B4423]">
                          {plan.paidInstallments || 0} /{" "}
                          {plan.numberOfInstallments}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipts Tab */}
        {selectedTab === "receipts" && (
          <div className="bg-white rounded-lg shadow-sm border border-[#C8A27B]/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EFE7D3]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Receipt Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8A27B]/20">
                  {receipts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-[#6B4423]"
                      >
                        No receipts available
                      </td>
                    </tr>
                  ) : (
                    receipts.map((receipt) => (
                      <tr key={receipt.receiptId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-[#4A2F19]">
                          {receipt.receiptNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B4423]">
                          {new Date(receipt.issuedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B4423]">
                          {receipt.description}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#4A2F19]">
                          ${receipt.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B4423]">
                          {receipt.paymentMethod}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() =>
                              handleDownloadReceipt(
                                receipt.receiptId,
                                receipt.receiptNumber,
                              )
                            }
                            className="flex items-center gap-2 text-[#C8A27B] hover:text-[#4A2F19] transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {selectedTab === "payments" && (
          <div className="bg-white rounded-lg shadow-sm border border-[#C8A27B]/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EFE7D3]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4A2F19] uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8A27B]/20">
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-[#6B4423]"
                      >
                        No payment history available
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.paymentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-[#4A2F19]">
                          {payment.stripePaymentIntentId?.substring(0, 20)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B4423]">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B4423]">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#4A2F19]">
                          ${payment.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === "Succeeded"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
