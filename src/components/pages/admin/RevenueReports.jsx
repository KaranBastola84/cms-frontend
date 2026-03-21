import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Download,
  Loader2,
  Filter,
  BarChart3,
  PieChart,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  getRevenueReport,
  getCourseRevenue,
} from "../../../services/financialReportService";
import toast from "react-hot-toast";

function RevenueReports() {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [courseRevenueData, setCourseRevenueData] = useState(null);
  const [reportType, setReportType] = useState("overall"); // overall, course
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const toNumber = (value) => Number(value || 0);

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      const data = await getRevenueReport(startDate, endDate);
      setRevenueData(data);
      toast.success("Revenue report generated");
    } catch (error) {
      toast.error(error.message || "Failed to generate revenue report");
      console.error("Error fetching revenue report:", error);
      setRevenueData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseRevenue = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    setLoading(true);
    try {
      const data = await getCourseRevenue(selectedCourseId, startDate, endDate);
      setCourseRevenueData(data);
      toast.success("Course revenue report generated");
    } catch (error) {
      toast.error(error.message || "Failed to generate course revenue report");
      console.error("Error fetching course revenue:", error);
      setCourseRevenueData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === "overall") {
      fetchRevenueReport();
    } else {
      fetchCourseRevenue();
    }
  };

  const exportReport = () => {
    if (!revenueData && !courseRevenueData) {
      toast.error("Please generate a report first");
      return;
    }

    let csvContent = "";

    if (reportType === "overall" && revenueData) {
      csvContent = [
        "Revenue Report",
        `Period: ${startDate} to ${endDate}`,
        "",
        "Metric,Value",
        `Total Revenue,$${toNumber(revenueData.totalRevenue).toLocaleString()}`,
        `Cash Revenue,$${toNumber(revenueData.cashRevenue).toLocaleString()}`,
        `Stripe Revenue,$${toNumber(revenueData.stripeRevenue).toLocaleString()}`,
        `Cash Payment Count,${toNumber(revenueData.cashPaymentCount)}`,
        `Total Transactions,${toNumber(revenueData.totalTransactions)}`,
        `Average Transaction Value,$${toNumber(revenueData.averageTransactionValue).toLocaleString()}`,
        `Product Sales Revenue,$${toNumber(revenueData.productSalesRevenue).toLocaleString()}`,
      ].join("\n");
    } else if (reportType === "course" && courseRevenueData) {
      csvContent = [
        "Course Revenue Report",
        `Course: ${courseRevenueData.courseName}`,
        `Period: ${startDate} to ${endDate}`,
        "",
        "Metric,Value",
        `Total Revenue,$${courseRevenueData.totalRevenue.toLocaleString()}`,
        `Students Enrolled,${courseRevenueData.totalStudentsEnrolled}`,
        `Average Revenue per Student,$${courseRevenueData.averageRevenuePerStudent.toLocaleString()}`,
        `Outstanding Amount,$${courseRevenueData.outstandingAmount.toLocaleString()}`,
      ].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const getPredefinedDateRange = (range) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">Revenue Reports</h1>
          <p className="text-[#8B6F47] mt-1">
            Generate and analyze revenue data
          </p>
        </div>
        {(revenueData || courseRevenueData) && (
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
        <h2 className="text-xl font-semibold text-[#3D2817] mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Report Configuration
        </h2>

        <div className="space-y-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-[#3D2817] mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setReportType("overall")}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  reportType === "overall"
                    ? "border-[#4A2F19] bg-[#FFF8F0] text-[#3D2817]"
                    : "border-[#E8DCC8] bg-white text-[#8B6F47] hover:border-[#4A2F19]"
                }`}
              >
                <BarChart3 className="w-5 h-5 mx-auto mb-2" />
                <span className="font-medium">Overall Revenue</span>
              </button>
              <button
                onClick={() => setReportType("course")}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  reportType === "course"
                    ? "border-[#4A2F19] bg-[#FFF8F0] text-[#3D2817]"
                    : "border-[#E8DCC8] bg-white text-[#8B6F47] hover:border-[#4A2F19]"
                }`}
              >
                <PieChart className="w-5 h-5 mx-auto mb-2" />
                <span className="font-medium">Course Revenue</span>
              </button>
            </div>
          </div>

          {/* Course Selection (if course report) */}
          {reportType === "course" && (
            <div>
              <label className="block text-sm font-medium text-[#3D2817] mb-2">
                Select Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
              >
                <option value="">-- Select a Course --</option>
                <option value="5">Web Development</option>
                <option value="6">Data Science</option>
                <option value="7">Mobile App Development</option>
                <option value="8">Cloud Computing</option>
              </select>
            </div>
          )}

          {/* Quick Date Ranges */}
          <div>
            <label className="block text-sm font-medium text-[#3D2817] mb-2">
              Quick Date Ranges
            </label>
            <div className="flex flex-wrap gap-2">
              {["today", "week", "month", "quarter", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => getPredefinedDateRange(range)}
                  className="px-3 py-1 text-sm bg-[#FFF8F0] text-[#3D2817] rounded-lg hover:bg-[#F5E6D3] transition-colors capitalize"
                >
                  {range === "today"
                    ? "Today"
                    : `Last ${range.replace("_", " ")}`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3D2817] mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3D2817] mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full px-6 py-3 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overall Revenue Report */}
      {reportType === "overall" && revenueData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#3D2817]">
                Overall Revenue Report
              </h2>
              <div className="flex items-center text-sm text-[#8B6F47]">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(revenueData.startDate).toLocaleDateString()} -{" "}
                {new Date(revenueData.endDate).toLocaleDateString()}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-green-700 mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-green-900">
                  ${toNumber(revenueData.totalRevenue).toLocaleString()}
                </h3>
              </div>

              <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700 mb-1">Cash Revenue</p>
                <h3 className="text-3xl font-bold text-blue-900">
                  ${toNumber(revenueData.cashRevenue).toLocaleString()}
                </h3>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-purple-700 mb-1">Stripe Revenue</p>
                <h3 className="text-3xl font-bold text-purple-900">
                  ${toNumber(revenueData.stripeRevenue).toLocaleString()}
                </h3>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-sm text-orange-700 mb-1">Cash Payments</p>
                <h3 className="text-3xl font-bold text-orange-900">
                  {toNumber(revenueData.cashPaymentCount).toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-[#FFF8F0] rounded-lg p-6 border border-[#E8DCC8]">
              <h3 className="text-lg font-semibold text-[#3D2817] mb-4">
                Revenue Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[#E8DCC8]">
                  <span className="text-[#3D2817] font-medium">
                    Total Transactions
                  </span>
                  <span className="text-lg font-bold text-[#4A2F19]">
                    {toNumber(revenueData.totalTransactions).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-[#E8DCC8]">
                  <span className="text-[#3D2817] font-medium">
                    Cash Revenue
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      ${toNumber(revenueData.cashRevenue).toLocaleString()}
                    </span>
                    <p className="text-xs text-[#8B6F47]">
                      {(
                        (toNumber(revenueData.cashRevenue) /
                          Math.max(1, toNumber(revenueData.totalRevenue))) *
                        100
                      ).toFixed(1)}
                      % of total
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#3D2817] font-medium">
                    Stripe Revenue
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-600">
                      ${toNumber(revenueData.stripeRevenue).toLocaleString()}
                    </span>
                    <p className="text-xs text-[#8B6F47]">
                      {(
                        (toNumber(revenueData.stripeRevenue) /
                          Math.max(1, toNumber(revenueData.totalRevenue))) *
                        100
                      ).toFixed(1)}
                      % of total
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#E8DCC8]">
                  <span className="text-[#3D2817] font-medium">
                    Average Transaction
                  </span>
                  <span className="text-lg font-bold text-[#4A2F19]">
                    $
                    {toNumber(
                      revenueData.averageTransactionValue,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Revenue Report */}
      {reportType === "course" && courseRevenueData && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#3D2817]">
              Course Revenue Report: {courseRevenueData.courseName}
            </h2>
            <div className="flex items-center text-sm text-[#8B6F47]">
              <Calendar className="w-4 h-4 mr-2" />
              {startDate && endDate ? `${startDate} - ${endDate}` : "All Time"}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <DollarSign className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-green-700 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-green-900">
                ${courseRevenueData.totalRevenue.toLocaleString()}
              </h3>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 mb-1">Students Enrolled</p>
              <h3 className="text-3xl font-bold text-blue-900">
                {courseRevenueData.totalStudentsEnrolled}
              </h3>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm text-purple-700 mb-1">Avg per Student</p>
              <h3 className="text-3xl font-bold text-purple-900">
                ${courseRevenueData.averageRevenuePerStudent.toLocaleString()}
              </h3>
            </div>

            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <DollarSign className="w-8 h-8 text-orange-600 mb-2" />
              <p className="text-sm text-orange-700 mb-1">Outstanding</p>
              <h3 className="text-3xl font-bold text-orange-900">
                ${courseRevenueData.outstandingAmount.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-[#FFF8F0] rounded-lg p-6 border border-[#E8DCC8]">
            <h3 className="text-lg font-semibold text-[#3D2817] mb-4">
              Course Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#E8DCC8]">
                <span className="text-[#3D2817] font-medium">
                  Collection Rate
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {(
                      ((courseRevenueData.totalRevenue -
                        courseRevenueData.outstandingAmount) /
                        courseRevenueData.totalRevenue) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-[#E8DCC8]">
                <span className="text-[#3D2817] font-medium">
                  Revenue per Enrollment
                </span>
                <span className="text-lg font-bold text-[#4A2F19]">
                  ${courseRevenueData.averageRevenuePerStudent.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#3D2817] font-medium">
                  Pending Collections
                </span>
                <span className="text-lg font-bold text-orange-600">
                  ${courseRevenueData.outstandingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!revenueData && !courseRevenueData && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-[#E8DCC8]">
          <BarChart3 className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#8B6F47] text-lg">
            Select report options and click "Generate Report" to view revenue
            data
          </p>
        </div>
      )}
    </div>
  );
}

export default RevenueReports;
