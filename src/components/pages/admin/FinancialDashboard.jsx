import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2,
  CreditCard,
  ShoppingCart,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getFinancialSummary } from "../../../services/financialReportService";
import {
  getOverdueInstallments,
  getUpcomingInstallments,
} from "../../../services/paymentPlanService";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [overdueInstallments, setOverdueInstallments] = useState([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryData, overdueData, upcomingData] = await Promise.all([
        getFinancialSummary(),
        getOverdueInstallments(),
        getUpcomingInstallments(7),
      ]);

      setSummary(summaryData);
      setOverdueInstallments(overdueData || []);
      setUpcomingInstallments(upcomingData || []);
    } catch (error) {
      toast.error("Failed to load financial dashboard");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">
            Loading financial dashboard...
          </p>
        </div>
      </div>
    );
  }

  const toNumber = (value) => Number(value || 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${toNumber(summary?.totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Outstanding Payments",
      value: `$${toNumber(summary?.totalOutstanding).toLocaleString()}`,
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
      count: summary?.totalPendingPayments || 0,
      subtitle: `${summary?.totalPendingPayments || 0} pending`,
    },
    {
      title: "Cash Revenue",
      value: `$${toNumber(summary?.totalCashRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-blue-100 text-blue-600",
      subtitle: `${toNumber(summary?.totalCashPayments)} cash payments`,
    },
    {
      title: "Stripe Revenue",
      value: `$${toNumber(summary?.totalStripeRevenue).toLocaleString()}`,
      icon: ShoppingCart,
      color: "bg-purple-100 text-purple-600",
      subtitle: "Online payments",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">
            Financial Dashboard
          </h1>
          <p className="text-[#8B6F47] mt-1">
            Overview of your financial health
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B6F47] mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[#3D2817]">
                  {stat.value}
                </h3>
                {stat.subtitle && (
                  <p className="text-sm text-[#8B6F47] mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <h2 className="text-xl font-semibold text-[#3D2817] mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Revenue Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[#FFF8F0] rounded-lg">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-[#4A2F19] mr-3" />
                <span className="text-[#3D2817] font-medium">
                  Stripe Revenue
                </span>
              </div>
              <span className="text-lg font-bold text-[#3D2817]">
                ${toNumber(summary?.totalStripeRevenue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#FFF8F0] rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-[#4A2F19] mr-3" />
                <span className="text-[#3D2817] font-medium">Cash Revenue</span>
              </div>
              <span className="text-lg font-bold text-[#3D2817]">
                ${toNumber(summary?.totalCashRevenue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#FFF8F0] rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-[#4A2F19] mr-3" />
                <span className="text-[#3D2817] font-medium">
                  Paid Students
                </span>
              </div>
              <span className="text-lg font-bold text-[#3D2817]">
                {toNumber(summary?.totalPaidStudents).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <h2 className="text-xl font-semibold text-[#3D2817] mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/finance/outstanding-payments"
              className="block w-full px-4 py-3 bg-[#FFF8F0] text-[#3D2817] rounded-lg hover:bg-[#F5E6D3] transition-colors text-center font-medium"
            >
              View Outstanding Payments
            </Link>
            <Link
              to="/admin/finance/payment-plans"
              className="block w-full px-4 py-3 bg-[#FFF8F0] text-[#3D2817] rounded-lg hover:bg-[#F5E6D3] transition-colors text-center font-medium"
            >
              Manage Payment Plans
            </Link>
            <Link
              to="/admin/finance/revenue-reports"
              className="block w-full px-4 py-3 bg-[#FFF8F0] text-[#3D2817] rounded-lg hover:bg-[#F5E6D3] transition-colors text-center font-medium"
            >
              Generate Revenue Report
            </Link>
            <Link
              to="/admin/finance/fee-management"
              className="block w-full px-4 py-3 bg-[#FFF8F0] text-[#3D2817] rounded-lg hover:bg-[#F5E6D3] transition-colors text-center font-medium"
            >
              Fee Structures
            </Link>
          </div>
        </div>
      </div>

      {/* Overdue & Upcoming Installments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Installments */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <h2 className="text-xl font-semibold text-[#3D2817] mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Overdue Installments ({overdueInstallments.length})
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {overdueInstallments.length === 0 ? (
              <p className="text-[#8B6F47] text-center py-4">
                No overdue installments
              </p>
            ) : (
              overdueInstallments.slice(0, 5).map((installment) => (
                <div
                  key={installment.installmentId}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#3D2817]">
                        {installment.studentName}
                      </p>
                      <p className="text-sm text-[#8B6F47]">
                        {installment.courseName}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {installment.daysOverdue} days overdue
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        ${installment.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {overdueInstallments.length > 5 && (
            <Link
              to="/admin/finance/outstanding-payments"
              className="block text-center text-[#4A2F19] hover:underline mt-4"
            >
              View all {overdueInstallments.length} overdue
            </Link>
          )}
        </div>

        {/* Upcoming Installments */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <h2 className="text-xl font-semibold text-[#3D2817] mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Upcoming Installments ({upcomingInstallments.length})
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingInstallments.length === 0 ? (
              <p className="text-[#8B6F47] text-center py-4">
                No upcoming installments
              </p>
            ) : (
              upcomingInstallments.slice(0, 5).map((installment) => (
                <div
                  key={installment.installmentId}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#3D2817]">
                        {installment.studentName}
                      </p>
                      <p className="text-sm text-[#8B6F47]">
                        {installment.courseName}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Due in {installment.daysUntilDue} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ${installment.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {upcomingInstallments.length > 5 && (
            <Link
              to="/admin/finance/payment-plans"
              className="block text-center text-[#4A2F19] hover:underline mt-4"
            >
              View all {upcomingInstallments.length} upcoming
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialDashboard;
