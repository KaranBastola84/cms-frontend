import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
    toast.success("Logged out successfully");
    logout(); // redirection to /login
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
    <div className="flex h-screen bg-[#F5EFE6]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } coffee-gradient text-white transition-all duration-300 flex flex-col shadow-coffee-lg`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-[#6B4423]/30">
          <Link
            to={`/${user?.role?.toLowerCase()}/dashboard`}
            className="flex items-center gap-3 no-underline text-white group"
          >
            <div className="bg-white/15 p-2 rounded-xl group-hover:bg-white/25 transition-all">
              <Coffee className="w-7 h-7 text-[#EFE7D3]" strokeWidth={2.5} />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-bold m-0">Coffee School</h2>
                <p className="text-xs text-[#EFE7D3] m-0 font-semibold">
                  Management System
                </p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
                  isActive
                    ? "bg-white/20 text-white shadow-sm scale-[1.02]"
                    : "text-[#EFE7D3] hover:bg-white/10 hover:text-white"
                }`}
                title={!sidebarOpen ? item.name : ""}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <span className="font-semibold">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#6B4423]/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#C8A27B] flex items-center justify-center shrink-0 shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate m-0">
                  {user?.username}
                </p>
                <p className="text-xs text-[#EFE7D3] m-0 font-medium">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] transition-all text-white shadow-sm hover:shadow-md font-semibold ${
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
        <header className="bg-white shadow-coffee-sm border-b border-[#C8A27B]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1A1A1A] m-0 flex items-center gap-2">
              {user?.role} Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#4A2F19]">
                Welcome back,{" "}
                <strong className="text-[#1A1A1A]">{user?.username}</strong>!
              </span>
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
