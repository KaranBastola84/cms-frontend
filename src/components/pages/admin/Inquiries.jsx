import React, { useState, useEffect } from "react";
import inquiryService from "../../../services/inquiryService";
import userManagementService from "../../../services/userManagementService";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  UserCog,
  X,
  Send,
  GraduationCap,
} from "lucide-react";

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form data
  const [statusData, setStatusData] = useState({
    status: "",
    responseNotes: "",
  });
  const [followUpNote, setFollowUpNote] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [convertData, setConvertData] = useState({
    password: "",
    address: "",
    emergencyContact: "",
    feesTotal: "",
    feesPaid: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);

  const statuses = [
    {
      value: "Pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      value: "InProgress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "Contacted",
      label: "Contacted",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "Enrolled",
      label: "Enrolled",
      color: "bg-green-100 text-green-700",
    },
    { value: "Rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
    { value: "Closed", label: "Closed", color: "bg-gray-100 text-gray-700" },
  ];

  useEffect(() => {
    fetchInquiries();
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, assignedFilter]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedToId = assignedFilter;

      const data = await inquiryService.getAllInquiries(params);
      setInquiries(data.inquiries || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error(error.message || "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const users = await userManagementService.getAllUsers();
      const staffList = users.filter(
        (u) => (u.role === "Admin" || u.role === "Staff") && u.isActive,
      );
      setStaff(staffList);
    } catch {
      // Silent fail - staff filter will just be empty
    }
  };

  const fetchFollowUps = async (inquiryId) => {
    try {
      const data = await inquiryService.getFollowUps(inquiryId);
      setFollowUps(data || []);
    } catch {
      toast.error("Failed to fetch follow-ups");
    }
  };

  const openDetailsModal = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
    await fetchFollowUps(inquiry.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedInquiry || !statusData.status) {
      toast.error("Please select a status");
      return;
    }

    setActionLoading(true);
    try {
      await inquiryService.updateStatus(selectedInquiry.id, statusData);
      toast.success("Status updated successfully");
      setShowStatusModal(false);
      setStatusData({ status: "", responseNotes: "" });
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedInquiry || !assignedToId) {
      toast.error("Please select a staff member");
      return;
    }

    setActionLoading(true);
    try {
      await inquiryService.assignInquiry(
        selectedInquiry.id,
        parseInt(assignedToId),
      );
      toast.success("Inquiry assigned successfully");
      setShowAssignModal(false);
      setAssignedToId("");
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to assign inquiry");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!selectedInquiry || !followUpNote.trim()) {
      toast.error("Please enter a follow-up note");
      return;
    }

    if (followUpNote.length < 5) {
      toast.error("Follow-up note must be at least 5 characters");
      return;
    }

    setActionLoading(true);
    try {
      await inquiryService.addFollowUp(selectedInquiry.id, followUpNote);
      toast.success("Follow-up added successfully");
      setFollowUpNote("");
      await fetchFollowUps(selectedInquiry.id);
    } catch (error) {
      toast.error(error.message || "Failed to add follow-up");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedInquiry) return;

    setActionLoading(true);
    try {
      const data = {};
      if (convertData.password) data.password = convertData.password;
      if (convertData.address) data.address = convertData.address;
      if (convertData.emergencyContact)
        data.emergencyContact = convertData.emergencyContact;
      if (convertData.feesTotal)
        data.feesTotal = parseFloat(convertData.feesTotal);
      if (convertData.feesPaid)
        data.feesPaid = parseFloat(convertData.feesPaid);

      await inquiryService.convertToStudent(selectedInquiry.id, data);
      toast.success("Inquiry converted to student successfully");
      setShowConvertModal(false);
      setConvertData({
        password: "",
        address: "",
        emergencyContact: "",
        feesTotal: "",
        feesPaid: "",
      });
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to convert inquiry");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;

    setActionLoading(true);
    try {
      await inquiryService.deleteInquiry(selectedInquiry.id);
      toast.success("Inquiry deleted successfully");
      setShowDeleteModal(false);
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      toast.error(error.message || "Failed to delete inquiry");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = statuses.find((s) => s.value === status);
    return statusInfo
      ? statusInfo
      : { color: "bg-gray-100 text-gray-700", label: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.phoneNumber?.includes(searchQuery),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#4A2F19] animate-spin" />
          <p className="text-[#4A2F19] font-semibold">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Inquiries & Follow-ups
              </h1>
              <p className="text-[#6B4423]">
                Manage and track course inquiries ({filteredInquiries.length}{" "}
                inquiries)
              </p>
            </div>
            <button
              onClick={fetchInquiries}
              disabled={loading}
              className="coffee-gradient text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md hover:shadow-coffee-lg flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-coffee-md p-4 border border-[#C8A27B]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Assigned</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-xl shadow-coffee-md border border-[#C8A27B]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EFE7D3] border-b-2 border-[#C8A27B]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Inquirer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Course Interest
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A27B]/30">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <MessageSquare className="w-16 h-16 text-[#C8A27B] opacity-50" />
                        <p className="text-[#6B4423] font-semibold">
                          No inquiries found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-[#F8F4EE]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">
                            {inquiry.fullName}
                          </p>
                          <p className="text-sm text-[#6B4423]">
                            {inquiry.email}
                          </p>
                          <p className="text-sm text-[#6B4423]">
                            {inquiry.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#4A2F19]">
                        {inquiry.courseInterest || "Not specified"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                            getStatusBadge(inquiry.status).color
                          }`}
                        >
                          {getStatusBadge(inquiry.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {inquiry.assignedToUsername ? (
                          <span className="text-sm text-[#4A2F19] font-semibold">
                            {inquiry.assignedToUsername}
                          </span>
                        ) : (
                          <span className="text-sm text-[#6B4423] italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B4423]">
                        {formatDate(inquiry.submittedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailsModal(inquiry)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setStatusData({
                                status: inquiry.status,
                                responseNotes: "",
                              });
                              setShowStatusModal(true);
                            }}
                            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setAssignedToId(
                                inquiry.assignedToId?.toString() || "",
                              );
                              setShowAssignModal(true);
                            }}
                            className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                            title="Assign"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          {!inquiry.isConverted && (
                            <button
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setShowConvertModal(true);
                              }}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                              title="Convert to Student"
                            >
                              <GraduationCap className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-[#EFE7D3] border-t border-[#C8A27B]/30 flex items-center justify-between">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white text-[#4A2F19] font-semibold rounded-lg hover:bg-[#F8F4EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[#4A2F19] font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white text-[#4A2F19] font-semibold rounded-lg hover:bg-[#F8F4EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Inquiry Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedInquiry(null);
                  setFollowUps([]);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold">
                    Full Name
                  </p>
                  <p className="text-[#1A1A1A]">{selectedInquiry.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold">Email</p>
                  <p className="text-[#1A1A1A]">{selectedInquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold">Phone</p>
                  <p className="text-[#1A1A1A]">
                    {selectedInquiry.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold">
                    Course Interest
                  </p>
                  <p className="text-[#1A1A1A]">
                    {selectedInquiry.courseInterest || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(selectedInquiry.status).color}`}
                  >
                    {getStatusBadge(selectedInquiry.status).label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold">
                    Assigned To
                  </p>
                  <p className="text-[#1A1A1A]">
                    {selectedInquiry.assignedToUsername || "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#6B4423] font-semibold mb-1">
                  Message
                </p>
                <p className="text-[#1A1A1A] bg-[#F8F4EE] p-3 rounded-lg">
                  {selectedInquiry.message}
                </p>
              </div>

              {selectedInquiry.responseNotes && (
                <div>
                  <p className="text-sm text-[#6B4423] font-semibold mb-1">
                    Response Notes
                  </p>
                  <p className="text-[#1A1A1A] bg-[#F8F4EE] p-3 rounded-lg">
                    {selectedInquiry.responseNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Follow-ups Section */}
            <div className="border-t border-[#C8A27B]/30 pt-4">
              <h4 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Follow-up Notes
              </h4>

              {/* Add Follow-up */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a follow-up note..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg focus:outline-none focus:border-[#4A2F19]"
                  disabled={actionLoading}
                />
                <button
                  onClick={handleAddFollowUp}
                  disabled={actionLoading || !followUpNote.trim()}
                  className="coffee-gradient text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Follow-ups List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {followUps.length === 0 ? (
                  <p className="text-[#6B4423] text-sm italic text-center py-4">
                    No follow-up notes yet
                  </p>
                ) : (
                  followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="bg-[#F8F4EE] p-3 rounded-lg"
                    >
                      <p className="text-[#1A1A1A] text-sm">{followUp.note}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#6B4423]">
                        <span className="font-semibold">
                          {followUp.createdBy?.username || "Unknown"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(followUp.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Update Status
              </h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedInquiry(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                  Status
                </label>
                <select
                  value={statusData.status}
                  onChange={(e) =>
                    setStatusData({ ...statusData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                >
                  <option value="">Select status</option>
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                  Response Notes (Optional)
                </label>
                <textarea
                  value={statusData.responseNotes}
                  onChange={(e) =>
                    setStatusData({
                      ...statusData,
                      responseNotes: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                  placeholder="Add any notes about this status update..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedInquiry(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading || !statusData.status}
                className="flex-1 px-4 py-3 coffee-gradient text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Assign Inquiry
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedInquiry(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Assign To
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
              >
                <option value="">Select staff member</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.username} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedInquiry(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={actionLoading || !assignedToId}
                className="flex-1 px-4 py-3 coffee-gradient text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Student Modal */}
      {showConvertModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Convert to Student
              </h3>
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedInquiry(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-[#F8F4EE] rounded-lg">
              <p className="text-sm text-[#4A2F19]">
                <strong>Name:</strong> {selectedInquiry.fullName}
              </p>
              <p className="text-sm text-[#4A2F19]">
                <strong>Email:</strong> {selectedInquiry.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={convertData.password}
                    onChange={(e) =>
                      setConvertData({
                        ...convertData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                    placeholder="Auto-generated if blank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={convertData.emergencyContact}
                    onChange={(e) =>
                      setConvertData({
                        ...convertData,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                  Address
                </label>
                <textarea
                  value={convertData.address}
                  onChange={(e) =>
                    setConvertData({ ...convertData, address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Total Fees
                  </label>
                  <input
                    type="number"
                    value={convertData.feesTotal}
                    onChange={(e) =>
                      setConvertData({
                        ...convertData,
                        feesTotal: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Fees Paid
                  </label>
                  <input
                    type="number"
                    value={convertData.feesPaid}
                    onChange={(e) =>
                      setConvertData({
                        ...convertData,
                        feesPaid: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedInquiry(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
                Convert to Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Delete Inquiry
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedInquiry(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[#6B4423] mb-3">
                Are you sure you want to delete this inquiry?
              </p>
              <div className="bg-[#F8F4EE] p-4 rounded-lg">
                <p className="font-bold text-[#1A1A1A]">
                  {selectedInquiry.fullName}
                </p>
                <p className="text-sm text-[#6B4423]">
                  {selectedInquiry.email}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm font-semibold">
                  This action cannot be undone!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedInquiry(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
