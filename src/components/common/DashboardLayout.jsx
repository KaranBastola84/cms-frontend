import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Coffee,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role;

    const commonItems = [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: `/${role?.toLowerCase()}/dashboard`,
      },
    ];

    const roleSpecificItems = {
      Admin: [
        { name: "Users", icon: Users, path: "/admin/users" },
        { name: "Courses", icon: BookOpen, path: "/admin/courses" },
        { name: "Inquiries", icon: FileText, path: "/admin/inquiries" },
        { name: "Settings", icon: Settings, path: "/admin/settings" },
      ],
      Staff: [
        { name: "Students", icon: Users, path: "/staff/students" },
        { name: "Courses", icon: BookOpen, path: "/staff/courses" },
        { name: "Inquiries", icon: FileText, path: "/staff/inquiries" },
      ],
      Trainer: [
        { name: "My Classes", icon: BookOpen, path: "/trainer/classes" },
        { name: "Students", icon: Users, path: "/trainer/students" },
        { name: "Schedule", icon: Calendar, path: "/trainer/schedule" },
      ],
      Student: [
        { name: "My Courses", icon: BookOpen, path: "/student/courses" },
        { name: "Schedule", icon: Calendar, path: "/student/schedule" },
        { name: "Progress", icon: FileText, path: "/student/progress" },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-linear-to-b from-amber-800 to-amber-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-amber-700">
          <Link
            to={`/${user?.role?.toLowerCase()}/dashboard`}
            className="flex items-center gap-3 no-underline text-white"
          >
            <Coffee className="w-8 h-8" strokeWidth={2.5} />
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-bold m-0">Coffee School</h2>
                <p className="text-xs text-amber-200 m-0">CMS</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-amber-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors no-underline ${
                  isActive
                    ? "bg-amber-700 text-white"
                    : "text-amber-100 hover:bg-amber-700/50"
                }`}
                title={!sidebarOpen ? item.name : ""}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-amber-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate m-0">
                  {user?.username}
                </p>
                <p className="text-xs text-amber-200 m-0">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 m-0">
              {user?.role} Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome back, <strong>{user?.username}</strong>!
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
