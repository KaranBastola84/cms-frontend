import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Search,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Loader2,
  Download,
  Filter,
} from "lucide-react";
import { getOutstandingPayments } from "../../../services/financialReportService";
import toast from "react-hot-toast";

function OutstandingPayments() {
  const [loading, setLoading] = useState(true);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, overdue, pending

  const filterPayments = useCallback(() => {
    let filtered = outstandingPayments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.studentEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    if (filterType === "overdue") {
      filtered = filtered.filter((payment) => payment.overdueInstallments > 0);
    } else if (filterType === "pending") {
      filtered = filtered.filter(
        (payment) =>
          payment.pendingInstallments > 0 && payment.overdueInstallments === 0,
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, filterType, outstandingPayments]);

  useEffect(() => {
    fetchOutstandingPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  const fetchOutstandingPayments = async () => {
    setLoading(true);
    try {
      const data = await getOutstandingPayments();
      setOutstandingPayments(data || []);
      setFilteredPayments(data || []);
    } catch (error) {
      toast.error("Failed to load outstanding payments");
      console.error("Error fetching outstanding payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Student Name",
      "Email",
      "Course",
      "Total Amount",
      "Paid",
      "Outstanding",
      "Status",
      "Overdue Days",
    ];
    const csvData = filteredPayments.map((p) => [
      p.studentName,
      p.studentEmail,
      p.courseName,
      p.totalAmount,
      p.paidAmount,
      p.outstandingAmount,
      p.status,
      p.daysOverdue || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outstanding-payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">
            Loading outstanding payments...
          </p>
        </div>
      </div>
    );
  }

  const totalOutstanding = filteredPayments.reduce(
    (sum, p) => sum + (p.outstandingAmount || 0),
    0,
  );
  const totalOverdue = filteredPayments.filter(
    (p) => p.overdueInstallments > 0,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">
            Outstanding Payments
          </h1>
          <p className="text-[#8B6F47] mt-1">
            Manage pending and overdue student payments
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Total Outstanding</p>
              <h3 className="text-2xl font-bold text-[#3D2817]">
                ${totalOutstanding.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Overdue Payments</p>
              <h3 className="text-2xl font-bold text-red-600">
                {totalOverdue}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Total Students</p>
              <h3 className="text-2xl font-bold text-[#3D2817]">
                {filteredPayments.length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Filter className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
          >
            <option value="all">All Payments</option>
            <option value="overdue">Overdue Only</option>
            <option value="pending">Pending Only</option>
          </select>

          <button
            onClick={fetchOutstandingPayments}
            className="px-4 py-2 bg-[#FFF8F0] text-[#3D2817] rounded-lg hover:bg-[#F5E6D3] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md border border-[#E8DCC8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8DCC8]">
            <thead className="bg-[#FFF8F0]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Total / Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Installments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2817] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E8DCC8]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colspan="7"
                    className="px-6 py-8 text-center text-[#8B6F47]"
                  >
                    No outstanding payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.paymentPlanId}
                    className="hover:bg-[#FFF8F0] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#3D2817]">
                          {payment.studentName}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-[#8B6F47]" />
                          <span className="text-xs text-[#8B6F47]">
                            {payment.studentEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-[#8B6F47]" />
                          <span className="text-xs text-[#8B6F47]">
                            {payment.studentPhone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#3D2817]">
                        {payment.courseName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#3D2817]">
                          ${payment.totalAmount?.toLocaleString()}
                        </span>
                        <span className="text-xs text-green-600">
                          Paid: ${payment.paidAmount?.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-orange-600">
                        ${payment.outstandingAmount?.toLocaleString()}
                      </span>
                      {payment.overdueAmount > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Overdue: ${payment.overdueAmount?.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#8B6F47]">
                          Pending: {payment.pendingInstallments}
                        </span>
                        {payment.overdueInstallments > 0 && (
                          <span className="text-xs text-red-600">
                            Overdue: {payment.overdueInstallments}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className={`px-2 py-1 text-xs rounded-full inline-block text-center ${
                            payment.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                        {payment.daysOverdue > 0 && (
                          <span className="text-xs text-red-600 mt-1">
                            {payment.daysOverdue} days overdue
                          </span>
                        )}
                        {payment.nextDueDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-[#8B6F47]" />
                            <span className="text-xs text-[#8B6F47]">
                              Next:{" "}
                              {new Date(
                                payment.nextDueDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-xs bg-[#4A2F19] text-white rounded hover:bg-[#3D2817] transition-colors"
                          onClick={() =>
                            toast("View details feature coming soon")
                          }
                        >
                          View Details
                        </button>
                        {payment.studentEmail && (
                          <a
                            href={`mailto:${payment.studentEmail}`}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Email
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OutstandingPayments;
