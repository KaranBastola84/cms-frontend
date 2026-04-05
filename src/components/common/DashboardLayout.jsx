import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Coffee,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  UserCircle,
  ChevronDown,
  ChevronRight,
  UserPlus,
  MessageSquare,
  UserCog,
  GraduationCap,
  CalendarClock,
  DollarSign,
  Package,
  ShoppingCart,
  ClipboardCheck,
  FileSearch,
  X,
  Mail,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ShieldCheck,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import dashboardService from "../../services/dashboardService";
import {
  normalizePermissionKey,
  normalizePermissionList,
} from "../../constants/permissions";

const getDashboardPathByRole = (role) => {
  if (role === "EnrolledStudent") {
    return "/student/dashboard";
  }
  return `/${String(role || "").toLowerCase()}/dashboard`;
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await dashboardService.getNotifications(50);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Don't show error toast for notifications, it's not critical
    } finally {
      setLoadingNotifications(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "payment":
        return <DollarSign className={iconClass} />;
      case "inquiry":
        return <Mail className={iconClass} />;
      case "attendance":
        return <AlertCircle className={iconClass} />;
      case "admission":
        return <GraduationCap className={iconClass} />;
      case "batch":
        return <BookOpen className={iconClass} />;
      case "payment-received":
        return <CheckCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 hover:bg-red-100 border-l-4 border-l-red-500";
      case "warning":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 border-l-4 border-l-yellow-500";
      case "info":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100 border-l-4 border-l-blue-500";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100 border-l-4 border-l-gray-500";
    }
  };

  const getSeverityIconColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const markSingleAsRead = async (notificationKey) => {
    try {
      await dashboardService.markNotificationAsRead(notificationKey);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationKey ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error(error.message || "Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await dashboardService.markAllNotificationsAsRead();
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(result.message || "All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error(error.message || "Failed to mark all notifications as read");
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Debounce global search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch global search results
  useEffect(() => {
    const runSearch = async () => {
      if (debouncedSearchQuery.length < 1) {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError(false);
        return;
      }

      setSearchLoading(true);
      setSearchError(false);
      try {
        const data = await dashboardService.globalSearch(
          debouncedSearchQuery,
          15,
        );
        setSearchResults(Array.isArray(data?.results) ? data.results : []);
      } catch (error) {
        console.error("Error searching dashboard:", error);
        setSearchResults([]);
        setSearchError(true);
        setShowSearchDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    };

    runSearch();
  }, [debouncedSearchQuery]);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchDropdown]);

  const groupedSearchResults = searchResults.reduce((acc, item) => {
    const groupKey = item?.type || "Other";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  const searchTypeIconMap = {
    Student: Users,
    Course: BookOpen,
    Batch: CalendarClock,
    Inquiry: MessageSquare,
  };

  const handleSearchResultClick = (result) => {
    if (!result?.navigateTo) return;
    navigate(result.navigateTo);
    setShowSearchDropdown(false);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSearchResults([]);
    setSearchError(false);
  };

  const toggleDropdown = (groupName) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    logout(); // redirection to /login
  };

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role;
    const userPermissions = normalizePermissionList(user?.permissions || []);

    // Helper function to check if user has permission
    const hasPermission = (permissionKey) => {
      // Admin has access to everything
      if (role === "Admin") return true;

      if (!permissionKey) return true;

      if (Array.isArray(permissionKey)) {
        return permissionKey.some((key) => hasPermission(key));
      }

      // Other roles need specific permission
      const normalizedKey = normalizePermissionKey(permissionKey);
      return userPermissions.includes(normalizedKey);
    };

    const commonItems = [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: getDashboardPathByRole(role),
        permission: "dashboard", // Everyone has dashboard access
      },
    ];

    const roleSpecificItems = {
      Admin: [
        {
          groupName: "User Management",
          icon: Users,
          permission: "dashboard",
          items: [
            {
              name: "All Users",
              icon: Users,
              path: "/admin/users",
              permission: "dashboard",
            },
            {
              name: "Student Management",
              icon: Users,
              path: "/admin/student-management",
              permission: ["view-students", "manage-students"],
            },
            {
              name: "Permissions",
              icon: ShieldCheck,
              path: "/admin/permissions",
              permission: "dashboard",
            },
            {
              name: "Student Registration",
              icon: UserPlus,
              path: "/admin/student-registration",
              permission: "manage-students",
            },
            {
              name: "Staff Management",
              icon: UserCog,
              path: "/admin/staff-management",
              permission: "dashboard",
            },
            {
              name: "Trainer Management",
              icon: GraduationCap,
              path: "/admin/trainer-management",
              permission: "dashboard",
            },
          ],
        },
        {
          groupName: "Academic",
          icon: BookOpen,
          permission: "courses-batches",
          items: [
            {
              name: "Course Management",
              icon: BookOpen,
              path: "/admin/course-management",
              permission: "courses-batches",
            },
            {
              name: "Batch & Schedule",
              icon: CalendarClock,
              path: "/admin/batch-schedule",
              permission: "courses-batches",
            },
            {
              name: "Attendance",
              icon: ClipboardCheck,
              path: "/admin/attendance",
              permission: "attendance",
            },
            {
              name: "Certificates",
              icon: BadgeCheck,
              path: "/admin/certificates",
              permission: ["view-students", "manage-students"],
            },
          ],
        },
        {
          groupName: "Business",
          icon: DollarSign,
          permission: "dashboard",
          items: [
            {
              name: "Products",
              icon: Package,
              path: "/admin/products",
              permission: "dashboard",
            },
            {
              name: "Orders",
              icon: ShoppingCart,
              path: "/admin/orders",
              permission: "dashboard",
            },
          ],
        },
        {
          groupName: "Payment & Finance",
          icon: DollarSign,
          permission: "payment-finance",
          items: [
            {
              name: "Financial Dashboard",
              icon: LayoutDashboard,
              path: "/admin/finance/dashboard",
              permission: "payment-finance",
            },
            {
              name: "Outstanding Payments",
              icon: AlertCircle,
              path: "/admin/finance/outstanding-payments",
              permission: "payment-finance",
            },
            {
              name: "Payment Plans",
              icon: Calendar,
              path: "/admin/finance/payment-plans",
              permission: "payment-finance",
            },
            {
              name: "Fee Management",
              icon: Settings,
              path: "/admin/finance/fee-management",
              permission: "payment-finance",
            },
            {
              name: "Revenue Reports",
              icon: FileText,
              path: "/admin/finance/revenue-reports",
              permission: ["payment-finance", "reports"],
            },
          ],
        },
        {
          groupName: "System",
          icon: Settings,
          permission: "dashboard",
          items: [
            {
              name: "Inquiries & Follow-ups",
              icon: MessageSquare,
              path: "/admin/inquiries",
              permission: "inquiries",
            },
            {
              name: "Audit Logs",
              icon: FileSearch,
              path: "/admin/audit-logs",
              permission: "reports",
            },
            {
              name: "Settings",
              icon: Settings,
              path: "/admin/settings",
              permission: "dashboard",
            },
          ],
        },
        {
          name: "Review Moderation",
          icon: ShieldCheck,
          path: "/admin/product-reviews",
          permission: "dashboard",
        },
      ],
      Staff: [
        {
          name: "Students",
          icon: Users,
          path: "/staff/students",
          permission: ["view-students", "manage-students"],
        },
        {
          name: "Courses",
          icon: BookOpen,
          path: "/staff/courses",
          permission: "courses-batches",
        },
        {
          name: "Batch & Schedule",
          icon: CalendarClock,
          path: "/staff/batches",
          permission: "courses-batches",
        },
        {
          name: "Attendance",
          icon: ClipboardCheck,
          path: "/staff/attendance",
          permission: "attendance",
        },
        {
          name: "Inquiries",
          icon: FileText,
          path: "/admin/inquiries",
          permission: "inquiries",
        },
        {
          name: "Certificates",
          icon: BadgeCheck,
          path: "/staff/certificates",
          permission: "view-students",
        },
        {
          groupName: "Payment & Finance",
          icon: DollarSign,
          permission: "payment-finance",
          items: [
            {
              name: "Financial Dashboard",
              icon: LayoutDashboard,
              path: "/admin/finance/dashboard",
              permission: "payment-finance",
            },
            {
              name: "Outstanding Payments",
              icon: AlertCircle,
              path: "/admin/finance/outstanding-payments",
              permission: "payment-finance",
            },
            {
              name: "Payment Plans",
              icon: Calendar,
              path: "/admin/finance/payment-plans",
              permission: "payment-finance",
            },
            {
              name: "Revenue Reports",
              icon: FileText,
              path: "/admin/finance/revenue-reports",
              permission: ["payment-finance", "reports"],
            },
          ],
        },
        {
          name: "Settings",
          icon: Settings,
          path: "/admin/settings",
          permission: "dashboard",
        },
      ],
      Trainer: [
        {
          name: "Students",
          icon: Users,
          path: "/staff/students",
          permission: ["view-students", "manage-students"],
        },
        {
          name: "Courses",
          icon: BookOpen,
          path: "/admin/course-management",
          permission: "courses-batches",
        },
        {
          name: "Batch & Schedule",
          icon: CalendarClock,
          path: "/admin/batch-schedule",
          permission: "courses-batches",
        },
        {
          name: "Attendance",
          icon: ClipboardCheck,
          path: "/admin/attendance",
          permission: "attendance",
        },
        {
          name: "Inquiries",
          icon: MessageSquare,
          path: "/admin/inquiries",
          permission: "inquiries",
        },
        {
          name: "Certificates",
          icon: BadgeCheck,
          path: "/trainer/certificates",
          permission: ["view-students", "manage-students"],
        },
        {
          groupName: "Payment & Finance",
          icon: DollarSign,
          permission: "payment-finance",
          items: [
            {
              name: "Financial Dashboard",
              icon: LayoutDashboard,
              path: "/admin/finance/dashboard",
              permission: "payment-finance",
            },
            {
              name: "Outstanding Payments",
              icon: AlertCircle,
              path: "/admin/finance/outstanding-payments",
              permission: "payment-finance",
            },
            {
              name: "Payment Plans",
              icon: Calendar,
              path: "/admin/finance/payment-plans",
              permission: "payment-finance",
            },
            {
              name: "Revenue Reports",
              icon: FileText,
              path: "/admin/finance/revenue-reports",
              permission: ["payment-finance", "reports"],
            },
          ],
        },
        {
          name: "Settings",
          icon: Settings,
          path: "/admin/settings",
          permission: "dashboard",
        },
      ],
      Student: [
        {
          name: "My Certificates",
          icon: BadgeCheck,
          path: "/student/certificates",
          permission: "dashboard",
        },
      ],
      EnrolledStudent: [
        {
          name: "My Certificates",
          icon: BadgeCheck,
          path: "/student/certificates",
          permission: "dashboard",
        },
      ],
    };

    // Filter navigation items based on permissions
    const filterNavItems = (items) => {
      if (!items) return [];

      return items
        .map((item) => {
          // If it's a group with sub-items
          if (item.groupName) {
            const filteredSubItems = item.items.filter((subItem) =>
              hasPermission(subItem.permission),
            );
            // Only show group if it has at least one accessible sub-item
            if (filteredSubItems.length > 0) {
              return { ...item, items: filteredSubItems };
            }
            return null;
          }
          // Regular item
          if (hasPermission(item.permission)) {
            return item;
          }
          return null;
        })
        .filter(Boolean); // Remove null items
    };

    const filtered = filterNavItems(roleSpecificItems[role] || []);

    return { commonItems, roleSpecificItems: filtered };
  };

  const { commonItems, roleSpecificItems } = getNavItems();

  return (
    <div className="flex h-screen bg-[#F5EFE6]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#4b301d] border-r border-[#2A1810] flex flex-col shadow-coffee-lg">
        {/* Logo */}
        <div className="p-4 flex items-center border-b border-[#5A3F2E] text-white">
          <Link
            to={getDashboardPathByRole(user?.role)}
            className="flex items-center gap-3 no-underline group"
          >
            <div className="coffee-gradient p-2 rounded-xl group-hover:opacity-90 transition-all shadow-sm">
              <Coffee
                className="w-7 h-7 text-white opacity-85"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold m-0 text-white! opacity-85">
                Coffee School
              </h2>
              <p className="text-xs text-white! opacity-75 m-0 font-semibold">
                {user?.role} Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Common Items (Dashboard) */}
          {commonItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
                  isActive
                    ? "bg-[#6B4423] text-white opacity-100 shadow-coffee-sm scale-[1.02] font-bold"
                    : "text-white opacity-80 hover:opacity-100 hover:bg-[#5A3F2E] font-semibold"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Role-Specific Items */}
          {roleSpecificItems.map((item, index) => {
            // Check if it's a dropdown group
            if (item.groupName) {
              const GroupIcon = item.icon;
              const isOpen = openDropdowns[item.groupName];
              const hasActiveChild = item.items.some(
                (subItem) => location.pathname === subItem.path,
              );

              return (
                <div key={index}>
                  {/* Dropdown Header */}
                  <button
                    onClick={() => toggleDropdown(item.groupName)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
                      hasActiveChild || isOpen
                        ? "bg-[#5A3F2E] text-white opacity-100"
                        : "text-white opacity-80 hover:opacity-100 hover:bg-[#5A3F2E]"
                    } font-semibold`}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className="w-5 h-5 shrink-0" />
                      <span>{item.groupName}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Dropdown Items */}
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all no-underline ${
                              isActive
                                ? "bg-[#6B4423] text-white opacity-100 shadow-coffee-sm font-bold"
                                : "text-white opacity-75 hover:opacity-100 hover:bg-[#5A3F2E] font-medium"
                            }`}
                          >
                            <SubIcon className="w-4 h-4 shrink-0" />
                            <span className="text-sm">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              // Regular nav item (for other roles)
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
                    isActive
                      ? "bg-[#6B4423] text-white opacity-100 shadow-coffee-sm scale-[1.02] font-bold"
                      : "text-white opacity-80 hover:opacity-100 hover:bg-[#5A3F2E] font-semibold"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            }
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#5A3F2E]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] transition-all text-white shadow-sm hover:shadow-md font-bold hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#fffcf5] shadow-coffee-sm border-b border-[#C8A27B]/20 px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B4423]" />
              <input
                type="text"
                placeholder="Search courses, students, schedules..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError(false);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#C8A27B]/30 bg-[#F5EFE6]/50 focus:outline-none focus:border-[#4A2F19] focus:ring-2 focus:ring-[#4A2F19]/20 transition-all text-[#1A1A1A] placeholder-[#6B4423]/60"
              />

              {showSearchDropdown && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-[#C8A27B]/30 rounded-xl shadow-coffee-lg overflow-hidden">
                  {searchLoading ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-[#6B4423]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </div>
                  ) : !debouncedSearchQuery ? (
                    <div className="p-4 text-sm text-[#6B4423]">
                      Start typing to search students, courses, batches, and
                      inquiries.
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-[#6B4423]">
                      No results
                      {searchError ? "" : ` for "${debouncedSearchQuery}".`}
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {Object.entries(groupedSearchResults).map(
                        ([type, items]) => {
                          const TypeIcon =
                            searchTypeIconMap[type] || FileSearch;
                          return (
                            <div
                              key={type}
                              className="border-b border-[#EFE7D3] last:border-b-0"
                            >
                              <div className="px-3 py-2 bg-[#F5EFE6]/60 text-xs font-bold text-[#6B4423] uppercase tracking-wide flex items-center gap-2">
                                <TypeIcon className="w-3.5 h-3.5" />
                                {type}
                              </div>
                              {items.map((result) => (
                                <button
                                  key={`${type}-${result.id}`}
                                  type="button"
                                  onClick={() =>
                                    handleSearchResultClick(result)
                                  }
                                  className="w-full text-left px-3 py-2.5 hover:bg-[#EFE7D3]/60 transition-colors"
                                >
                                  <p className="m-0 text-sm font-semibold text-[#1A1A1A]">
                                    {result.title}
                                  </p>
                                  <p className="m-0 text-xs text-[#6B4423]">
                                    {result.subtitle || "-"}
                                  </p>
                                  {result.status && (
                                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#EFE7D3] text-[#4A2F19] font-semibold">
                                      {result.status}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Section: Notifications & Profile */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-[#EFE7D3]/50 transition-all group"
                >
                  <Bell className="w-6 h-6 text-[#4A2F19] group-hover:text-[#1A1A1A]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 max-h-150 bg-white rounded-lg shadow-2xl overflow-hidden z-50 border-2 border-[#4A2F19]/10">
                    <div className="bg-[#4A2F19] text-white p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg m-0">Notifications</h3>
                        <p className="text-sm text-[#EFE7D3] m-0">
                          {unreadCount} unread
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchNotifications();
                            toast.success("Notifications refreshed");
                          }}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Refresh notifications"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-125">
                      {loadingNotifications ? (
                        <div className="p-8 text-center text-[#6B4423]">
                          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#4A2F19]" />
                          <p className="m-0 text-sm">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="bg-[#EFE7D3]/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-10 h-10 text-[#6B4423] opacity-40" />
                          </div>
                          <p className="text-[#4A2F19] font-semibold m-0 mb-1">
                            All caught up!
                          </p>
                          <p className="text-sm text-[#6B4423] m-0">
                            No new notifications
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#EFE7D3]">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markSingleAsRead(notification.id);
                                }
                              }}
                              className={`p-4 transition-colors border cursor-pointer ${getSeverityStyle(notification.severity)} ${
                                !notification.isRead ? "font-semibold" : ""
                              }`}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`shrink-0 p-2 rounded-lg ${getSeverityIconColor(notification.severity)}`}
                                >
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-bold text-[#1A1A1A] m-0">
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#4A2F19] m-0 mb-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-[#6B4423] m-0">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && !loadingNotifications && (
                      <div className="p-3 bg-[#EFE7D3] border-t-2 border-[#4A2F19]/20 sticky bottom-0">
                        <button
                          onClick={() => {
                            markAllAsRead();
                          }}
                          className="w-full text-center text-sm text-white bg-[#4A2F19] hover:bg-[#6B4423] transition-colors py-2.5 px-4 rounded-lg font-semibold shadow-sm hover:shadow-md"
                        >
                          Mark All as Read{" "}
                          {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div
                onClick={() => navigate("/admin/settings")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#EFE7D3]/50 transition-all cursor-pointer group"
                title="Settings"
              >
                <UserCircle className="w-8 h-8 text-[#4A2F19] group-hover:text-[#1A1A1A]" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#EFE7D3]/40">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
