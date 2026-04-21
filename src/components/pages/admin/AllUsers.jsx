import React, { useState, useEffect, useCallback } from "react";
import userManagementService from "../../../services/userManagementService";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldX,
  Trash2,
  Filter,
  UserCog,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import StudentManagementPanel from "./StudentManagementPanel";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newRole, setNewRole] = useState("");

  const roles = ["Admin", "Staff", "Trainer", "Student"];

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Role filter
    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active";
      filtered = filtered.filter((user) => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userManagementService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    setActionLoading(true);
    try {
      await userManagementService.activateUser(userId);
      toast.success("User activated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to activate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    setActionLoading(true);
    try {
      await userManagementService.deactivateUser(userId);
      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to deactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userManagementService.deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(true);
    try {
      await userManagementService.updateUserRole(selectedUser.id, newRole);
      toast.success("User role updated successfully");
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-700 border-red-300";
      case "Staff":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Trainer":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "Student":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#4A2F19] animate-spin" />
          <p className="text-[#4A2F19] font-semibold">Loading users...</p>
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
                All Users
              </h1>
              <p className="text-[#6B4423]">
                Manage all users in the system ({filteredUsers.length} users)
              </p>
            </div>
            <button
              onClick={fetchUsers}
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
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B4423]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#C8A27B]/40 rounded-lg bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-coffee-md border border-[#C8A27B]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EFE7D3] border-b-2 border-[#C8A27B]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#1A1A1A]">
                    Email
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
              <tbody className="divide-y divide-[#C8A27B]/30">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-16 h-16 text-[#C8A27B] opacity-50" />
                        <p className="text-[#6B4423] font-semibold">
                          No users found
                        </p>
                        <p className="text-sm text-[#6B4423]">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#F8F4EE]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#EFE7D3] p-2 rounded-full">
                            <Users className="w-4 h-4 text-[#4A2F19]" />
                          </div>
                          <span className="font-semibold text-[#1A1A1A]">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#4A2F19]">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(
                            user.role,
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B4423]">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Change Role */}
                          <button
                            onClick={() => openRoleModal(user)}
                            disabled={actionLoading}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Change Role"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>

                          {/* Activate/Deactivate */}
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              disabled={actionLoading}
                              className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Deactivate User"
                            >
                              <ShieldX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              disabled={actionLoading}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Activate User"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => openDeleteModal(user)}
                            disabled={actionLoading}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete User"
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

        <StudentManagementPanel />
      </div>

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="coffee-gradient p-2 rounded-lg">
                  <UserCog className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">
                  Change User Role
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole("");
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[#6B4423] mb-4">
                Change role for{" "}
                <span className="font-bold text-[#1A1A1A]">
                  {selectedUser?.username}
                </span>
              </p>

              <label className="block text-sm font-semibold text-[#4A2F19] mb-2">
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#C8A27B]/40 rounded-xl bg-[#F8F4EE] focus:outline-none focus:border-[#4A2F19] transition-colors"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole("");
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={actionLoading || !newRole}
                className="flex-1 px-4 py-3 coffee-gradient text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-coffee-md hover:shadow-coffee-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Update Role</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-700" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">
                  Delete User
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="text-[#6B4423] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[#6B4423] mb-2">
                Are you sure you want to delete this user?
              </p>
              <div className="bg-[#F8F4EE] p-4 rounded-lg border border-[#C8A27B]/40">
                <p className="font-bold text-[#1A1A1A] mb-1">
                  {selectedUser?.username}
                </p>
                <p className="text-sm text-[#6B4423]">{selectedUser?.email}</p>
                <p className="text-sm text-[#6B4423] mt-2">
                  Role:{" "}
                  <span className="font-semibold">{selectedUser?.role}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-semibold m-0">
                  This action cannot be undone!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
