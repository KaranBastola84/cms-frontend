import React, { useState, useEffect, useCallback } from "react";
import trainerManagementService from "../../../services/trainerManagementService";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  RefreshCw,
  UserPlus,
  Eye,
  Trash2,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Power,
  PowerOff,
  RotateCw,
} from "lucide-react";

const TrainerManagement = () => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form data for creating trainer
  const [createData, setCreateData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    trainerRole: "",
  });

  const trainerRoles = [
    "All Rounder",
    "Barista Trainer",
    "Latte Art Trainer",
    "Espresso Specialist",
    "Coffee Roasting Trainer",
    "Customer Service Trainer",
    "Quality Control Trainer",
  ];

  const filterTrainers = useCallback(() => {
    let filtered = [...trainers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (member) =>
          `${member.firstName} ${member.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.phoneNumber?.includes(searchQuery) ||
          member.trainerRole?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Verification filter
    if (verificationFilter !== "All") {
      const isVerified = verificationFilter === "Verified";
      filtered = filtered.filter((member) => member.isVerified === isVerified);
    }

    // Active filter
    if (activeFilter !== "All") {
      const isActive = activeFilter === "Active";
      filtered = filtered.filter((member) => member.isActive === isActive);
    }

    setFilteredTrainers(filtered);
  }, [trainers, searchQuery, verificationFilter, activeFilter]);

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [filterTrainers]);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const data = await trainerManagementService.getAllTrainers();
      setTrainers(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch trainers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !createData.firstName ||
      !createData.lastName ||
      !createData.email ||
      !createData.phoneNumber ||
      !createData.trainerRole
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      await trainerManagementService.createTrainer(createData);
      toast.success("Trainer created successfully! OTP sent to email.");
      setShowCreateModal(false);
      setCreateData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        trainerRole: "",
      });
      fetchTrainers();
    } catch (error) {
      toast.error(error.message || "Failed to create trainer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (trainerId) => {
    setActionLoading(true);
    try {
      await trainerManagementService.activateTrainer(trainerId);
      toast.success("Trainer activated successfully");
      fetchTrainers();
    } catch (error) {
      toast.error(error.message || "Failed to activate trainer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (trainerId) => {
    setActionLoading(true);
    try {
      await trainerManagementService.deactivateTrainer(trainerId);
      toast.success("Trainer deactivated successfully");
      fetchTrainers();
    } catch (error) {
      toast.error(error.message || "Failed to deactivate trainer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendOTP = async (trainerId) => {
    setActionLoading(true);
    try {
      await trainerManagementService.resendOTP(trainerId);
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTrainer) return;

    setActionLoading(true);
    try {
      await trainerManagementService.deleteTrainer(selectedTrainer.id);
      toast.success("Trainer deleted successfully");
      setShowDeleteModal(false);
      setSelectedTrainer(null);
      fetchTrainers();
    } catch (error) {
      toast.error(error.message || "Failed to delete trainer");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailsModal = async (member) => {
    setSelectedTrainer(member);
    setShowDetailsModal(true);
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

  const getStatusBadge = (member) => {
    if (!member.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Pending Verification
        </span>
      );
    }
    if (!member.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#4A2F19] animate-spin" />
          <p className="text-[#4A2F19] font-semibold">Loading trainers...</p>
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
                Trainer Management
              </h1>
              <p className="text-[#6B4423]">
                Manage trainer accounts and permissions (
                {filteredTrainers.length} trainers)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchTrainers}
                disabled={loading}
                className="coffee-gradient text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md hover:shadow-coffee-lg flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Trainer</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-coffee-md p-4 border border-[#C8A27B]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                />
              </div>

              {/* Verification Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">All Verification Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>

              {/* Active Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">All Active Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Trainers Table */}
        <div className="bg-white rounded-xl shadow-coffee-md border border-[#C8A27B]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EFE7D3] border-b-2 border-[#C8A27B]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Trainer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A27B]/20">
                {filteredTrainers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-[#6B4423]"
                    >
                      <Users className="w-12 h-12 mx-auto mb-4 text-[#C8A27B]" />
                      <p className="text-lg font-semibold">No trainers found</p>
                      <p className="text-sm">
                        Create a new trainer account to get started
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTrainers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-[#F8F4EE]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#4A2F19] text-white flex items-center justify-center font-semibold">
                            {member.firstName?.[0]}
                            {member.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A1A1A]">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-[#6B4423]">
                              ID: {member.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#4A2F19]">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#4A2F19]">
                            <Phone className="w-3 h-3" />
                            {member.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#6B4423]" />
                          <span className="text-sm font-medium text-[#4A2F19]">
                            {member.trainerRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(member)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#4A2F19]">
                          {formatDate(member.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailsModal(member)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!member.isVerified && (
                            <button
                              onClick={() => handleResendOTP(member.id)}
                              disabled={actionLoading}
                              className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Resend OTP"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                          )}

                          {member.isVerified && !member.isActive && (
                            <button
                              onClick={() => handleActivate(member.id)}
                              disabled={actionLoading}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Activate"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}

                          {member.isActive && (
                            <button
                              onClick={() => handleDeactivate(member.id)}
                              disabled={actionLoading}
                              className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Deactivate"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedTrainer(member);
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
        </div>
      </div>

      {/* Create Trainer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Create New Trainer
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    trainerRole: "",
                  });
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createData.firstName}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createData.lastName}
                    onChange={(e) =>
                      setCreateData({ ...createData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createData.email}
                  onChange={(e) =>
                    setCreateData({ ...createData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={createData.phoneNumber}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                  Trainer Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={createData.trainerRole}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      trainerRole: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select a role</option>
                  {trainerRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      What happens after creation:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Trainer receives OTP via email (valid 15 minutes)</li>
                      <li>Trainer verifies OTP and sets their password</li>
                      <li>
                        You must activate the account before they can login
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phoneNumber: "",
                      trainerRole: "",
                    });
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Create Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTrainer && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Trainer Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTrainer(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-[#C8A27B]/30">
                <div className="w-16 h-16 rounded-full bg-[#4A2F19] text-white flex items-center justify-center text-2xl font-semibold">
                  {selectedTrainer.firstName?.[0]}
                  {selectedTrainer.lastName?.[0]}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1A1A1A]">
                    {selectedTrainer.firstName} {selectedTrainer.lastName}
                  </h4>
                  <p className="text-sm text-[#6B4423]">
                    {selectedTrainer.trainerRole}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F4EE] rounded-lg p-4">
                  <p className="text-xs text-[#6B4423] mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {selectedTrainer.email}
                  </p>
                </div>
                <div className="bg-[#F8F4EE] rounded-lg p-4">
                  <p className="text-xs text-[#6B4423] mb-1">Phone</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {selectedTrainer.phoneNumber}
                  </p>
                </div>
                <div className="bg-[#F8F4EE] rounded-lg p-4">
                  <p className="text-xs text-[#6B4423] mb-1">Trainer ID</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {selectedTrainer.id}
                  </p>
                </div>
                <div className="bg-[#F8F4EE] rounded-lg p-4">
                  <p className="text-xs text-[#6B4423] mb-1">Created</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {formatDate(selectedTrainer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F4EE] rounded-lg p-4">
                  <p className="text-xs text-[#6B4423] mb-2">
                    Verification Status
                  </p>
                  {selectedTrainer.isVerified ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Pending Verification
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-[#F8F4EE] rounded-lg p-4">
                  <p className="text-xs text-[#6B4423] mb-2">Active Status</p>
                  {selectedTrainer.isActive ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <Power className="w-4 h-4" />
                      <span className="text-sm font-semibold">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <PowerOff className="w-4 h-4" />
                      <span className="text-sm font-semibold">Inactive</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {!selectedTrainer.isVerified && (
                  <button
                    onClick={() => {
                      handleResendOTP(selectedTrainer.id);
                      setShowDetailsModal(false);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCw className="w-4 h-4" />
                    Resend OTP
                  </button>
                )}

                {selectedTrainer.isVerified && !selectedTrainer.isActive && (
                  <button
                    onClick={() => {
                      handleActivate(selectedTrainer.id);
                      setShowDetailsModal(false);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Power className="w-4 h-4" />
                    Activate Trainer
                  </button>
                )}

                {selectedTrainer.isActive && (
                  <button
                    onClick={() => {
                      handleDeactivate(selectedTrainer.id);
                      setShowDetailsModal(false);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <PowerOff className="w-4 h-4" />
                    Deactivate Trainer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTrainer && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Delete Trainer Account
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTrainer(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning</p>
                    <p>
                      This action cannot be undone. The trainer account will be
                      permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[#4A2F19]">
                Are you sure you want to delete{" "}
                <strong>
                  {selectedTrainer.firstName} {selectedTrainer.lastName}
                </strong>
                ?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTrainer(null);
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

export default TrainerManagement;
