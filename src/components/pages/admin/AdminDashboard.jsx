import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Coffee,
  DollarSign,
  Activity,
  BarChart3,
  Calendar,
  Loader2,
} from "lucide-react";
import dashboardService from "../../../services/dashboardService";
import toast from "react-hot-toast";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [overview, setOverview] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [activities, setActivities] = useState([]);
  const [charts, setCharts] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [
        overviewData,
        financialData,
        activitiesData,
        chartsData,
        attendanceData,
      ] = await Promise.all([
        dashboardService.getOverview().catch((err) => {
          console.error("Overview Error:", err);
          return null;
        }),
        dashboardService.getFinancial().catch((err) => {
          console.error("Financial Error:", err);
          return null;
        }),
        dashboardService.getActivities().catch((err) => {
          console.error("Activities Error:", err);
          return null;
        }),
        dashboardService.getCharts().catch((err) => {
          console.error("Charts Error:", err);
          return null;
        }),
        dashboardService.getAttendance().catch((err) => {
          console.error("Attendance Error:", err);
          return null;
        }),
      ]);

      // Check if backend is completely unavailable
      if (
        !overviewData &&
        !financialData &&
        !activitiesData &&
        !chartsData &&
        !attendanceData
      ) {
        setError(true);
        toast.error(
          "Unable to connect to the backend server. Please check if the server is running.",
        );
      }

      setOverview(overviewData);
      setFinancial(financialData);
      setActivities(activitiesData);
      setCharts(chartsData);
      setAttendance(attendanceData);
    } catch (error) {
      setError(true);
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state if backend is unavailable
  if (
    error &&
    !overview &&
    !financial &&
    !activities &&
    !charts &&
    !attendance
  ) {
    return (
      <div className="fade-in">
        <div className="coffee-card mb-6 coffee-gradient text-white hover-lift">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <Coffee className="w-10 h-10" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold m-0 mb-2">Admin Dashboard</h2>
              <p className="text-[#EFE7D3] m-0 font-medium">
                Manage your coffee school from one central location.
              </p>
            </div>
          </div>
        </div>

        <div className="coffee-card bg-red-50 border-2 border-red-200">
          <div className="text-center py-12">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Backend Server Unavailable
            </h3>
            <p className="text-red-700 mb-4 max-w-md mx-auto">
              Unable to connect to the backend server. Please ensure:
            </p>
            <ul className="text-left text-red-700 max-w-md mx-auto space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                The backend server is running
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                You are logged in with valid credentials
              </li>
            </ul>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Build stats array from overview data
  const stats = overview
    ? [
        {
          icon: Users,
          label: "Total Students",
          value: overview.students?.total?.toString() || "0",
          change: overview.students?.newThisMonth
            ? `+${overview.students.newThisMonth} this month`
            : "+0",
          color: "bg-[#4A2F19]",
        },
        {
          icon: BookOpen,
          label: "Active Courses",
          value: overview.courses?.active?.toString() || "0",
          change: overview.courses?.total
            ? `${overview.courses.total} total`
            : "0",
          color: "bg-[#6B4423]",
        },
        {
          icon: FileText,
          label: "Pending Inquiries",
          value: overview.inquiries?.pending?.toString() || "0",
          change: overview.inquiries?.total
            ? `${overview.inquiries.total} total`
            : "0",
          color: "bg-[#C8A27B]",
        },
        {
          icon: TrendingUp,
          label: "Active Batches",
          value: overview.batches?.active?.toString() || "0",
          change: overview.batches?.upcoming
            ? `${overview.batches.upcoming} upcoming`
            : "0",
          color: "bg-[#8B5E34]",
        },
      ]
    : [];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="coffee-card mb-6 coffee-gradient text-white hover-lift">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Coffee className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold m-0 mb-2">
              Welcome to Admin Dashboard
            </h2>
            <p className="text-[#EFE7D3] m-0 font-medium">
              Manage your coffee school from one central location.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="coffee-card hover-lift cursor-pointer slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.color} p-3 rounded-xl text-white shadow-coffee-sm`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#6B4423] m-0 font-semibold">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] m-0">
                      {stat.value}
                    </h3>
                    <span className="text-xs font-semibold text-green-600 badge-coffee bg-green-50">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Overview Breakdown */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Students Breakdown */}
          <div className="coffee-card hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-[#4A2F19]" />
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Students Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-semibold m-0 mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-blue-900 m-0">
                  {overview.students?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700 font-semibold m-0 mb-1">
                  Pending Payment
                </p>
                <p className="text-2xl font-bold text-yellow-900 m-0">
                  {overview.students?.pendingPayment || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-semibold m-0 mb-1">
                  Active Students
                </p>
                <p className="text-2xl font-bold text-green-900 m-0">
                  {overview.students?.active || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 font-semibold m-0 mb-1">
                  Enrolled
                </p>
                <p className="text-2xl font-bold text-purple-900 m-0">
                  {overview.students?.enrolled || 0}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 font-semibold m-0 mb-1">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 m-0">
                  {overview.students?.completed || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-700 font-semibold m-0 mb-1">
                  New This Month
                </p>
                <p className="text-2xl font-bold text-orange-900 m-0">
                  {overview.students?.newThisMonth || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Inquiries Breakdown */}
          <div className="coffee-card hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#4A2F19]" />
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Inquiries Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-semibold m-0 mb-1">
                  Total Inquiries
                </p>
                <p className="text-3xl font-bold text-blue-900 m-0">
                  {overview.inquiries?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700 font-semibold m-0 mb-1">
                  Pending (Left to Answer)
                </p>
                <p className="text-3xl font-bold text-yellow-900 m-0">
                  {overview.inquiries?.pending || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-semibold m-0 mb-1">
                  Followed Up
                </p>
                <p className="text-3xl font-bold text-green-900 m-0">
                  {overview.inquiries?.followedUp || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 font-semibold m-0 mb-1">
                  Closed
                </p>
                <p className="text-3xl font-bold text-gray-900 m-0">
                  {overview.inquiries?.closed || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Courses & Staff */}
          <div className="coffee-card hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-[#4A2F19]" />
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Courses Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-700 font-semibold m-0 mb-1">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-blue-900 m-0">
                  {overview.courses?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-700 font-semibold m-0 mb-1">
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-green-900 m-0">
                  {overview.courses?.active || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-700 font-semibold m-0 mb-1">
                  Inactive
                </p>
                <p className="text-3xl font-bold text-gray-900 m-0">
                  {overview.courses?.inactive || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Staff Overview */}
          <div className="coffee-card hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-[#4A2F19]" />
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Staff Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-purple-700 font-semibold m-0 mb-1">
                  Total Staff
                </p>
                <p className="text-3xl font-bold text-purple-900 m-0">
                  {overview.staff?.totalStaff || 0}
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg text-center">
                <p className="text-xs text-indigo-700 font-semibold m-0 mb-1">
                  Trainers
                </p>
                <p className="text-3xl font-bold text-indigo-900 m-0">
                  {overview.staff?.totalTrainers || 0}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-700 font-semibold m-0 mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-blue-900 m-0">
                  {overview.staff?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Batches Overview */}
          <div className="coffee-card hover-lift lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-[#4A2F19]" />
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Batches Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-700 font-semibold m-0 mb-1">
                  Total Batches
                </p>
                <p className="text-3xl font-bold text-blue-900 m-0">
                  {overview.batches?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-700 font-semibold m-0 mb-1">
                  Active
                </p>
                <p className="text-3xl font-bold text-green-900 m-0">
                  {overview.batches?.active || 0}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-xs text-yellow-700 font-semibold m-0 mb-1">
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-yellow-900 m-0">
                  {overview.batches?.upcoming || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-700 font-semibold m-0 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-gray-900 m-0">
                  {overview.batches?.completed || 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-purple-700 font-semibold m-0 mb-1">
                  Capacity Utilization
                </p>
                <p className="text-3xl font-bold text-purple-900 m-0">
                  {overview.batches?.averageCapacityUtilization?.toFixed(0) ||
                    0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {financial && (
        <div className="coffee-card mb-6 hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-[#4A2F19]" />
            <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
              Financial Overview
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-[#EFE7D3]/50 rounded-lg">
              <p className="text-sm text-[#6B4423] m-0 mb-1 font-semibold">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] m-0">
                ${financial.revenue?.totalRevenue?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-4 bg-[#EFE7D3]/50 rounded-lg">
              <p className="text-sm text-[#6B4423] m-0 mb-1 font-semibold">
                This Month
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] m-0">
                ${financial.revenue?.revenueThisMonth?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-4 bg-[#EFE7D3]/50 rounded-lg">
              <p className="text-sm text-[#6B4423] m-0 mb-1 font-semibold">
                Total Outstanding
              </p>
              <p className="text-2xl font-bold text-red-600 m-0">
                $
                {financial.outstanding?.totalOutstanding?.toLocaleString() ||
                  "0"}
              </p>
            </div>
            <div className="p-4 bg-[#EFE7D3]/50 rounded-lg">
              <p className="text-sm text-[#6B4423] m-0 mb-1 font-semibold">
                Collection Rate
              </p>
              <p className="text-2xl font-bold text-green-600 m-0">
                {financial.collection?.collectionRate?.toFixed(1) || "0"}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700 m-0 mb-1 font-semibold">
                Overdue Amount
              </p>
              <p className="text-lg font-bold text-red-700 m-0">
                ${financial.outstanding?.overdueAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-red-600 m-0 mt-1">
                {financial.outstanding?.defaultersCount || 0} defaulters
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 m-0 mb-1 font-semibold">
                Due Next 7 Days
              </p>
              <p className="text-lg font-bold text-blue-700 m-0">
                $
                {financial.upcomingPayments?.amountDueNext7Days?.toLocaleString() ||
                  "0"}
              </p>
              <p className="text-xs text-blue-600 m-0 mt-1">
                {financial.upcomingPayments?.dueNext7Days || 0} payments
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 m-0 mb-1 font-semibold">
                Active Plans
              </p>
              <p className="text-lg font-bold text-green-700 m-0">
                {financial.paymentPlans?.activePlans || 0}
              </p>
              <p className="text-xs text-green-600 m-0 mt-1">
                {financial.paymentPlans?.completedPlans || 0} completed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Attendance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Charts Data */}
        {charts && (
          <div className="coffee-card hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-[#4A2F19]" />
              <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                Statistics & Trends
              </h3>
            </div>
            <div className="space-y-4">
              {/* Enrollment by Course */}
              {charts.enrollmentByCourse &&
                charts.enrollmentByCourse.length > 0 && (
                  <div>
                    <p className="text-sm text-[#6B4423] m-0 mb-2 font-semibold">
                      Enrollment by Course
                    </p>
                    <div className="space-y-2">
                      {charts.enrollmentByCourse
                        .slice(0, 5)
                        .map((course, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-[#1A1A1A] font-medium">
                                  {course.courseName}
                                </span>
                                <span className="text-xs text-[#6B4423]">
                                  {course.studentCount} students
                                </span>
                              </div>
                              <div className="h-2 bg-[#EFE7D3] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4A2F19] rounded-full"
                                  style={{ width: `${course.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Revenue Trend */}
              {charts.revenueTrend && charts.revenueTrend.length > 0 && (
                <div>
                  <p className="text-sm text-[#6B4423] m-0 mb-2 font-semibold">
                    Revenue Trend (Last 6 Months)
                  </p>
                  <div className="flex items-end gap-2 h-32">
                    {charts.revenueTrend.slice(-6).map((item, i) => {
                      const maxRevenue = Math.max(
                        ...charts.revenueTrend.slice(-6).map((x) => x.revenue),
                      );
                      const height = (item.revenue / maxRevenue) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="w-full bg-[#EFE7D3] rounded flex items-end"
                            style={{ height: "100px" }}
                          >
                            <div
                              className="w-full bg-[#4A2F19] rounded-t transition-all"
                              style={{ height: `${height}%` }}
                              title={`$${item.revenue.toLocaleString()}`}
                            ></div>
                          </div>
                          <p className="text-xs text-[#6B4423] mt-1">
                            {item.month}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Student Status Distribution */}
              {charts.studentStatusDistribution && (
                <div>
                  <p className="text-sm text-[#6B4423] m-0 mb-2 font-semibold">
                    Student Status
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="text-lg font-bold text-green-700 m-0">
                        {charts.studentStatusDistribution.active}
                      </p>
                      <p className="text-xs text-green-600 m-0">Active</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="text-lg font-bold text-blue-700 m-0">
                        {charts.studentStatusDistribution.enrolled}
                      </p>
                      <p className="text-xs text-blue-600 m-0">Enrolled</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-center">
                      <p className="text-lg font-bold text-yellow-700 m-0">
                        {charts.studentStatusDistribution.completed}
                      </p>
                      <p className="text-xs text-yellow-600 m-0">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Data */}
        <div className="coffee-card hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-[#4A2F19]" />
            <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
              Attendance Overview
            </h3>
          </div>
          {attendance ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#EFE7D3]/50 rounded-lg">
                  <p className="text-sm text-[#6B4423] m-0 mb-1">Today</p>
                  <p className="text-3xl font-bold text-[#1A1A1A] m-0">
                    {attendance.todayAttendanceRate?.toFixed(1) || "0"}%
                  </p>
                </div>
                <div className="p-4 bg-[#EFE7D3]/50 rounded-lg">
                  <p className="text-sm text-[#6B4423] m-0 mb-1">This Week</p>
                  <p className="text-3xl font-bold text-[#1A1A1A] m-0">
                    {attendance.thisWeekAttendanceRate?.toFixed(1) || "0"}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700 m-0">
                    {attendance.totalPresentToday || 0}
                  </p>
                  <p className="text-xs text-green-600 m-0">Present</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700 m-0">
                    {attendance.totalAbsentToday || 0}
                  </p>
                  <p className="text-xs text-red-600 m-0">Absent</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-700 m-0">
                    {attendance.totalLateToday || 0}
                  </p>
                  <p className="text-xs text-yellow-600 m-0">Late</p>
                </div>
              </div>

              {attendance.studentsWithLowAttendance > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 m-0 font-semibold">
                    ⚠️ {attendance.studentsWithLowAttendance} students with low
                    attendance
                  </p>
                </div>
              )}

              {/* Batch Attendance */}
              {Array.isArray(attendance.batchAttendance) &&
                attendance.batchAttendance.length > 0 && (
                  <div>
                    <p className="text-sm text-[#6B4423] m-0 mb-2 font-semibold">
                      Batch Attendance Today
                    </p>
                    <div className="space-y-2">
                      {attendance.batchAttendance
                        .slice(0, 5)
                        .map((batch, i) => (
                          <div key={i} className="p-2 bg-[#EFE7D3]/50 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-[#1A1A1A] font-medium">
                                {batch.batchName}
                              </span>
                              <span className="text-sm font-bold text-[#4A2F19]">
                                {batch.attendanceRate?.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-[#6B4423] m-0">
                              {batch.presentToday}/{batch.totalStudents} present
                              • {batch.courseName}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600 m-0">
                No attendance data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      {activities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Students */}
          {activities.recentStudents &&
            activities.recentStudents.length > 0 && (
              <div className="coffee-card hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-[#4A2F19]" />
                  <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                    Recent Students
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.recentStudents
                    .slice(0, 5)
                    .map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#EFE7D3]/50 rounded-lg border border-[#C8A27B]/20"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] m-0">
                            {student.name}
                          </p>
                          <p className="text-xs text-[#6B4423] m-0">
                            {student.courseName}
                          </p>
                          <p className="text-xs text-[#8B5E34] m-0">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge-coffee text-[#4A2F19]">
                          {student.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Recent Payments */}
          {activities.recentPayments &&
            activities.recentPayments.length > 0 && (
              <div className="coffee-card hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-5 h-5 text-[#4A2F19]" />
                  <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                    Recent Payments
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.recentPayments
                    .slice(0, 5)
                    .map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#EFE7D3]/50 rounded-lg border border-[#C8A27B]/20"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] m-0">
                            {payment.studentName}
                          </p>
                          <p className="text-xs text-[#6B4423] m-0">
                            {payment.paymentMethod}
                          </p>
                          <p className="text-xs text-[#8B5E34] m-0">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge-coffee text-green-700 bg-green-50">
                          ${payment.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Recent Inquiries & Upcoming Batches */}
      {activities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inquiries */}
          {activities.recentInquiries &&
            activities.recentInquiries.length > 0 && (
              <div className="coffee-card hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-[#4A2F19]" />
                  <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                    Recent Inquiries
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.recentInquiries
                    .slice(0, 5)
                    .map((inquiry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[#EFE7D3]/50 rounded-lg border border-[#C8A27B]/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#C8A27B]"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] m-0">
                            {inquiry.name}
                          </p>
                          <p className="text-xs text-[#6B4423] m-0">
                            {inquiry.courseName}
                          </p>
                          <p className="text-xs text-[#8B5E34] m-0">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge-coffee text-[#4A2F19]">
                          {inquiry.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Upcoming Batches */}
          {activities.upcomingBatches &&
            activities.upcomingBatches.length > 0 && (
              <div className="coffee-card hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-[#4A2F19]" />
                  <h3 className="text-lg font-bold text-[#1A1A1A] m-0">
                    Upcoming Batches
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.upcomingBatches
                    .slice(0, 5)
                    .map((batch, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#EFE7D3]/50 rounded-lg border border-[#C8A27B]/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] m-0">
                            {batch.batchName}
                          </p>
                          <span className="badge-coffee text-[#4A2F19]">
                            {batch.enrolledStudents}/{batch.capacity}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B4423] m-0">
                          {batch.courseName}
                        </p>
                        <p className="text-xs text-[#8B5E34] m-0">
                          Starts:{" "}
                          {new Date(batch.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
