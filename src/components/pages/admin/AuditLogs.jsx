import React, { useState, useEffect } from "react";
import {
  Shield,
  Filter,
  Search,
  RefreshCw,
  LogIn,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  FileText,
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
} from "lucide-react";
import auditLogService from "../../../services/auditLogService";
import toast from "react-hot-toast";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("All");
  const [filterAction, setFilterAction] = useState("All");
  const [expandedLog, setExpandedLog] = useState(null);

  const actionTypes = {
    0: {
      label: "Create",
      icon: UserPlus,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    1: {
      label: "Update",
      icon: Edit,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    2: {
      label: "Delete",
      icon: Trash2,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    3: {
      label: "Login",
      icon: LogIn,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    4: {
      label: "Logout",
      icon: LogIn,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    5: {
      label: "Failed Login",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  };

  const modules = [
    "All",
    "Auth",
    "User",
    "Student",
    "Staff",
    "Course",
    "Inquiry",
    "FeeStructure",
    "Batch",
    "Attendance",
    "Payment",
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Filter by module
    if (filterModule !== "All") {
      filtered = filtered.filter((log) => log.module === filterModule);
    }

    // Filter by action type
    if (filterAction !== "All") {
      filtered = filtered.filter(
        (log) => log.actionType === parseInt(filterAction),
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.additionalInfo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, filterModule, filterAction]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getAll();
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module) => {
    const moduleIcons = {
      Auth: LogIn,
      User: Users,
      Student: GraduationCap,
      Staff: Users,
      Course: BookOpen,
      Inquiry: FileText,
      FeeStructure: DollarSign,
      Batch: BookOpen,
      Attendance: CheckCircle,
      Payment: DollarSign,
    };
    return moduleIcons[module] || FileText;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatJsonValue = (jsonString) => {
    if (!jsonString) return null;
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="coffee-card mb-6 coffee-gradient text-white hover-lift">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Shield className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold m-0 mb-2">Audit Logs</h2>
            <p className="text-[#EFE7D3] m-0 font-medium">
              Track all system activities and user actions
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="coffee-card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B4423]" />
              <input
                type="text"
                placeholder="Search by user, action, or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#C8A27B]/30 bg-[#F5EFE6]/50 focus:outline-none focus:border-[#4A2F19] focus:ring-2 focus:ring-[#4A2F19]/20 transition-all"
              />
            </div>
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[#C8A27B]/30 bg-[#F5EFE6]/50 focus:outline-none focus:border-[#4A2F19] focus:ring-2 focus:ring-[#4A2F19]/20 transition-all"
            >
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module === "All" ? "All Modules" : module}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[#C8A27B]/30 bg-[#F5EFE6]/50 focus:outline-none focus:border-[#4A2F19] focus:ring-2 focus:ring-[#4A2F19]/20 transition-all"
            >
              <option value="All">All Actions</option>
              {Object.entries(actionTypes).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAuditLogs}
            className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#6B4423] transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-2 text-sm text-[#6B4423]">
          <Filter className="w-4 h-4" />
          <span>
            Showing <strong>{filteredLogs.length}</strong> of{" "}
            <strong>{logs.length}</strong> logs
          </span>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="coffee-card text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4 text-[#6B4423] opacity-30" />
            <p className="text-[#4A2F19] font-semibold mb-2">
              No audit logs found
            </p>
            <p className="text-sm text-[#6B4423]">
              {searchTerm || filterModule !== "All" || filterAction !== "All"
                ? "Try adjusting your filters"
                : "System activity will appear here"}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const action = actionTypes[log.actionType] || actionTypes[0];
            const ActionIcon = action.icon;
            const ModuleIcon = getModuleIcon(log.module);
            const isExpanded = expandedLog === log.logId;

            return (
              <div key={log.logId} className="coffee-card hover-lift">
                <div className="flex items-start gap-4">
                  {/* Action Icon */}
                  <div className={`shrink-0 p-3 rounded-lg ${action.bg}`}>
                    <ActionIcon className={`w-5 h-5 ${action.color}`} />
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${action.color}`}>
                            {action.label}
                          </span>
                          <span className="text-[#6B4423] text-sm">•</span>
                          <ModuleIcon className="w-4 h-4 text-[#6B4423]" />
                          <span className="text-[#6B4423] text-sm font-semibold">
                            {log.module}
                          </span>
                        </div>
                        <p className="text-[#1A1A1A] font-medium m-0 mb-1">
                          {log.additionalInfo}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedLog(isExpanded ? null : log.logId)
                        }
                        className="p-1 hover:bg-[#EFE7D3] rounded transition-colors shrink-0"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-[#6B4423]" />
                      </button>
                    </div>

                    {/* User & Metadata */}
                    <div className="flex flex-wrap gap-4 text-xs text-[#6B4423]">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{log.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>IP: {log.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>ID: {log.entityId}</span>
                      </div>
                      <div>{formatTimestamp(log.timestamp)}</div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#C8A27B]/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {log.previousValue && (
                            <div>
                              <p className="text-xs font-bold text-[#6B4423] mb-1">
                                Previous Value:
                              </p>
                              <pre className="text-xs bg-[#EFE7D3]/50 p-3 rounded overflow-x-auto max-h-40">
                                {formatJsonValue(log.previousValue)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <p className="text-xs font-bold text-[#6B4423] mb-1">
                                New Value:
                              </p>
                              <pre className="text-xs bg-[#EFE7D3]/50 p-3 rounded overflow-x-auto max-h-40">
                                {formatJsonValue(log.newValue)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
