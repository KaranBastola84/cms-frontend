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
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
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

  const formatCurrency = (value) => `$${(value || 0).toLocaleString()}`;

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
      toast.error(error.message || "Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-105 mb-6 caramel-cream-gradient text-[#4A2F19] p-8 rounded-2xl border border-[#C8A27B]/50 shadow-coffee-lg flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/65 p-4 rounded-2xl border border-[#4A2F19]/15 inline-flex mb-3">
            <Loader2 className="w-8 h-8 text-[#6B4423] animate-spin" />
          </div>
          <p className="text-[#6B4423] text-sm tracking-wide font-semibold">
            Loading dashboard data...
          </p>
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
      <div className="fade-in space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-amber-900 text-white p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 p-4 rounded-2xl">
              <Coffee className="w-10 h-10" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-bold m-0 mb-2">Admin Dashboard</h2>
              <p className="text-amber-100/90 m-0 font-medium">
                Manage your coffee school from one central location.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-red-200 shadow-sm">
          <div className="text-center py-12">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
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
          color: "from-slate-800 to-slate-700",
        },
        {
          icon: BookOpen,
          label: "Active Courses",
          value: overview.courses?.active?.toString() || "0",
          change: overview.courses?.total
            ? `${overview.courses.total} total`
            : "0",
          color: "from-amber-700 to-orange-700",
        },
        {
          icon: FileText,
          label: "Pending Inquiries",
          value: overview.inquiries?.pending?.toString() || "0",
          change: overview.inquiries?.total
            ? `${overview.inquiries.total} total`
            : "0",
          color: "from-teal-700 to-cyan-700",
        },
        {
          icon: TrendingUp,
          label: "Active Batches",
          value: overview.batches?.active?.toString() || "0",
          change: overview.batches?.upcoming
            ? `${overview.batches.upcoming} upcoming`
            : "0",
          color: "from-rose-700 to-red-700",
        },
      ]
    : [];

  const maxCourseEnrollment = charts?.enrollmentByCourse?.length
    ? Math.max(...charts.enrollmentByCourse.map((c) => c.studentCount || 0), 1)
    : 1;

  const maxRevenue = charts?.revenueTrend?.length
    ? Math.max(...charts.revenueTrend.slice(-6).map((x) => x.revenue || 0), 1)
    : 1;

  return (
    <div className="fade-in space-y-6 pb-4">
      <div className="mb-6 caramel-cream-gradient text-[#4A2F19] hover-lift p-6 md:p-8 rounded-2xl border border-[#C8A27B]/50 shadow-coffee-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-white/65 p-4 rounded-2xl border border-[#4A2F19]/15">
              <Coffee className="w-9 h-9" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight m-0">
                Admin Dashboard
              </h2>
              <p className="m-0 mt-2 text-[#6B4423] max-w-2xl">
                A sharper view of students, finances, inquiries, and operations
                in one place.
              </p>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/75 text-[#4A2F19] px-4 py-2 text-sm font-semibold border border-[#4A2F19]/20 hover:bg-white"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 p-5 slide-in h-full flex flex-col justify-between"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <div
                  className={`bg-linear-to-br ${stat.color} p-3 rounded-xl text-white shadow-md`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-500 m-0 font-semibold">
                {stat.label}
              </p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-3xl font-black text-slate-900 m-0 tracking-tight">
                  {stat.value}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 h-full">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-900 m-0">
                Students Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 items-stretch">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <p className="text-xs text-slate-500 font-semibold m-0 mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-black text-slate-900 m-0">
                  {overview.students?.total || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 h-full">
                <p className="text-xs text-amber-700 font-semibold m-0 mb-1">
                  Pending Payment
                </p>
                <p className="text-2xl font-black text-amber-900 m-0">
                  {overview.students?.pendingPayment || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 h-full">
                <p className="text-xs text-emerald-700 font-semibold m-0 mb-1">
                  Active Students
                </p>
                <p className="text-2xl font-black text-emerald-900 m-0">
                  {overview.students?.active || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 h-full">
                <p className="text-xs text-cyan-700 font-semibold m-0 mb-1">
                  Enrolled
                </p>
                <p className="text-2xl font-black text-cyan-900 m-0">
                  {overview.students?.enrolled || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 h-full">
                <p className="text-xs text-zinc-700 font-semibold m-0 mb-1">
                  Completed
                </p>
                <p className="text-2xl font-black text-zinc-900 m-0">
                  {overview.students?.completed || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 h-full">
                <p className="text-xs text-orange-700 font-semibold m-0 mb-1">
                  New This Month
                </p>
                <p className="text-2xl font-black text-orange-900 m-0">
                  {overview.students?.newThisMonth || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 h-full">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-900 m-0">
                Inquiries Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 items-stretch">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <p className="text-xs text-slate-600 font-semibold m-0 mb-1">
                  Total Inquiries
                </p>
                <p className="text-3xl font-black text-slate-900 m-0">
                  {overview.inquiries?.total || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 h-full">
                <p className="text-xs text-amber-700 font-semibold m-0 mb-1">
                  Pending
                </p>
                <p className="text-3xl font-black text-amber-900 m-0">
                  {overview.inquiries?.pending || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 h-full">
                <p className="text-xs text-emerald-700 font-semibold m-0 mb-1">
                  Followed Up
                </p>
                <p className="text-3xl font-black text-emerald-900 m-0">
                  {overview.inquiries?.followedUp || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 h-full">
                <p className="text-xs text-zinc-700 font-semibold m-0 mb-1">
                  Closed
                </p>
                <p className="text-3xl font-black text-zinc-900 m-0">
                  {overview.inquiries?.closed || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 h-full">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-900 m-0">
                Courses Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl text-center bg-sky-50 border border-sky-100">
                <p className="text-xs text-sky-700 font-semibold m-0 mb-1">
                  Total Courses
                </p>
                <p className="text-3xl font-black text-sky-900 m-0">
                  {overview.courses?.total || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-semibold m-0 mb-1">
                  Active Courses
                </p>
                <p className="text-3xl font-black text-emerald-900 m-0">
                  {overview.courses?.active || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-zinc-50 border border-zinc-200">
                <p className="text-xs text-zinc-700 font-semibold m-0 mb-1">
                  Inactive
                </p>
                <p className="text-3xl font-black text-zinc-900 m-0">
                  {overview.courses?.inactive || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 h-full">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-900 m-0">
                Staff Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl text-center bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-700 font-semibold m-0 mb-1">
                  Total Staff
                </p>
                <p className="text-3xl font-black text-slate-900 m-0">
                  {overview.staff?.totalStaff || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-teal-50 border border-teal-100">
                <p className="text-xs text-teal-700 font-semibold m-0 mb-1">
                  Trainers
                </p>
                <p className="text-3xl font-black text-teal-900 m-0">
                  {overview.staff?.totalTrainers || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-cyan-50 border border-cyan-100">
                <p className="text-xs text-cyan-700 font-semibold m-0 mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-black text-cyan-900 m-0">
                  {overview.staff?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 lg:col-span-2 h-full">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-900 m-0">
                Batches Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl text-center bg-sky-50 border border-sky-100">
                <p className="text-xs text-sky-700 font-semibold m-0 mb-1">
                  Total Batches
                </p>
                <p className="text-3xl font-black text-sky-900 m-0">
                  {overview.batches?.total || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-semibold m-0 mb-1">
                  Active
                </p>
                <p className="text-3xl font-black text-emerald-900 m-0">
                  {overview.batches?.active || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-700 font-semibold m-0 mb-1">
                  Upcoming
                </p>
                <p className="text-3xl font-black text-amber-900 m-0">
                  {overview.batches?.upcoming || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-zinc-50 border border-zinc-200">
                <p className="text-xs text-zinc-700 font-semibold m-0 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-black text-zinc-900 m-0">
                  {overview.batches?.completed || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl text-center bg-rose-50 border border-rose-100">
                <p className="text-xs text-rose-700 font-semibold m-0 mb-1">
                  Capacity
                </p>
                <p className="text-3xl font-black text-rose-900 m-0">
                  {overview.batches?.averageCapacityUtilization?.toFixed(0) ||
                    0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {financial && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-slate-800" />
            <h3 className="text-lg font-bold text-slate-900 m-0">
              Financial Overview
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 m-0 mb-1 font-semibold">
                Total Revenue
              </p>
              <p className="text-2xl font-black text-slate-900 m-0">
                {formatCurrency(financial.revenue?.totalRevenue)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-sm text-emerald-700 m-0 mb-1 font-semibold">
                This Month
              </p>
              <p className="text-2xl font-black text-emerald-900 m-0">
                {formatCurrency(financial.revenue?.revenueThisMonth)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-sm text-rose-700 m-0 mb-1 font-semibold">
                Total Outstanding
              </p>
              <p className="text-2xl font-black text-rose-900 m-0">
                {formatCurrency(financial.outstanding?.totalOutstanding)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
              <p className="text-sm text-cyan-700 m-0 mb-1 font-semibold">
                Collection Rate
              </p>
              <p className="text-2xl font-black text-cyan-900 m-0">
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
                {formatCurrency(financial.outstanding?.overdueAmount)}
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
                {formatCurrency(financial.upcomingPayments?.amountDueNext7Days)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-slate-800" />
              <h3 className="text-lg font-bold text-slate-900 m-0">
                Statistics & Trends
              </h3>
            </div>
            <div className="space-y-4">
              {charts.enrollmentByCourse &&
                charts.enrollmentByCourse.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 m-0 mb-2 font-semibold">
                      Enrollment by Course
                    </p>
                    <div className="space-y-2">
                      {charts.enrollmentByCourse
                        .slice(0, 5)
                        .map((course, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-slate-900 font-medium">
                                  {course.courseName}
                                </span>
                                <span className="text-xs text-slate-600">
                                  {course.studentCount} students
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-amber-600 to-orange-600 rounded-full"
                                  style={{
                                    width: `${Math.round(((course.studentCount || 0) / maxCourseEnrollment) * 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {charts.revenueTrend && charts.revenueTrend.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 m-0 mb-2 font-semibold">
                    Revenue Trend (Last 6 Months)
                  </p>
                  <div className="flex items-end gap-2 h-32">
                    {charts.revenueTrend.slice(-6).map((item, i) => {
                      const height = ((item.revenue || 0) / maxRevenue) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="w-full bg-slate-200 rounded flex items-end"
                            style={{ height: "100px" }}
                          >
                            <div
                              className="w-full bg-linear-to-t from-slate-800 to-slate-600 rounded-t transition-all"
                              style={{ height: `${height}%` }}
                              title={`$${item.revenue.toLocaleString()}`}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.month}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {charts.studentStatusDistribution && (
                <div>
                  <p className="text-sm text-slate-600 m-0 mb-2 font-semibold">
                    Student Status
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-center">
                      <p className="text-lg font-bold text-emerald-700 m-0">
                        {charts.studentStatusDistribution.active}
                      </p>
                      <p className="text-xs text-emerald-600 m-0">Active</p>
                    </div>
                    <div className="p-2 bg-cyan-50 border border-cyan-100 rounded text-center">
                      <p className="text-lg font-bold text-cyan-700 m-0">
                        {charts.studentStatusDistribution.enrolled}
                      </p>
                      <p className="text-xs text-cyan-600 m-0">Enrolled</p>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded text-center">
                      <p className="text-lg font-bold text-amber-700 m-0">
                        {charts.studentStatusDistribution.completed}
                      </p>
                      <p className="text-xs text-amber-600 m-0">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-slate-800" />
            <h3 className="text-lg font-bold text-slate-900 m-0">
              Attendance Overview
            </h3>
          </div>
          {attendance ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600 m-0 mb-1">Today</p>
                  <p className="text-3xl font-black text-slate-900 m-0">
                    {attendance.todayAttendanceRate?.toFixed(1) || "0"}%
                  </p>
                </div>
                <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg">
                  <p className="text-sm text-cyan-700 m-0 mb-1">This Week</p>
                  <p className="text-3xl font-black text-cyan-900 m-0">
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
                    {attendance.studentsWithLowAttendance} students with low
                    attendance
                  </p>
                </div>
              )}

              {Array.isArray(attendance.batchAttendance) &&
                attendance.batchAttendance.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 m-0 mb-2 font-semibold">
                      Batch Attendance Today
                    </p>
                    <div className="space-y-2">
                      {attendance.batchAttendance
                        .slice(0, 5)
                        .map((batch, i) => (
                          <div
                            key={i}
                            className="p-2 bg-slate-50 border border-slate-200 rounded"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-900 font-medium">
                                {batch.batchName}
                              </span>
                              <span className="text-sm font-bold text-slate-700">
                                {batch.attendanceRate?.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 m-0">
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

      {activities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activities.recentStudents &&
            activities.recentStudents.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-slate-800" />
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    Recent Students
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.recentStudents
                    .slice(0, 5)
                    .map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 m-0">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-600 m-0">
                            {student.courseName}
                          </p>
                          <p className="text-xs text-slate-500 m-0">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge-coffee text-slate-800">
                          {student.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {activities.recentInquiries &&
            activities.recentInquiries.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-slate-800" />
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    Recent Inquiries
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.recentInquiries
                    .slice(0, 5)
                    .map((inquiry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 m-0">
                            {inquiry.name}
                          </p>
                          <p className="text-xs text-slate-600 m-0">
                            {inquiry.courseName}
                          </p>
                          <p className="text-xs text-slate-500 m-0">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge-coffee text-slate-800">
                          {inquiry.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}

      {activities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activities.recentPayments &&
            activities.recentPayments.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-5 h-5 text-slate-800" />
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    Recent Payments
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.recentPayments
                    .slice(0, 5)
                    .map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 m-0">
                            {payment.studentName}
                          </p>
                          <p className="text-xs text-slate-600 m-0">
                            {payment.paymentMethod}
                          </p>
                          <p className="text-xs text-slate-500 m-0">
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

          {activities.upcomingBatches &&
            activities.upcomingBatches.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-slate-800" />
                  <h3 className="text-lg font-bold text-slate-900 m-0">
                    Upcoming Batches
                  </h3>
                </div>
                <div className="space-y-2">
                  {activities.upcomingBatches
                    .slice(0, 5)
                    .map((batch, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-900 m-0">
                            {batch.batchName}
                          </p>
                          <span className="badge-coffee text-slate-800">
                            {batch.enrolledStudents}/{batch.capacity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 m-0">
                          {batch.courseName}
                        </p>
                        <p className="text-xs text-slate-500 m-0">
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
