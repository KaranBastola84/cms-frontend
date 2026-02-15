import React from "react";
import { Users, BookOpen, FileText, TrendingUp, Coffee } from "lucide-react";

function AdminDashboard() {
  // Sample data - replace with real data from API
  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: "248",
      change: "+12%",
      color: "bg-[#4A2F19]",
    },
    {
      icon: BookOpen,
      label: "Active Courses",
      value: "12",
      change: "+3",
      color: "bg-[#6B4423]",
    },
    {
      icon: FileText,
      label: "Inquiries",
      value: "34",
      change: "+8",
      color: "bg-[#C8A27B]",
    },
    {
      icon: TrendingUp,
      label: "Enrollments",
      value: "156",
      change: "+18%",
      color: "bg-[#8B5E34]",
    },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="coffee-card mb-6 coffee-gradient text-white hover-lift">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Coffee className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold m-0 mb-2">
              Welcome to Admin Dashboard
            </h2>
            <p className="text-[#EFE7D3] m-0 font-medium">
              Manage your coffee school from one central location.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="coffee-card hover-lift cursor-pointer slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.color} p-3 rounded-xl text-white shadow-coffee-sm`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#6B4423] m-0 font-semibold">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] m-0">
                      {stat.value}
                    </h3>
                    <span className="text-xs font-semibold text-green-600 badge-coffee bg-green-50">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="coffee-card hover-lift">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4A2F19]" />
            Recent Inquiries
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 bg-[#EFE7D3]/50 rounded-lg border border-[#C8A27B]/20"
              >
                <div className="w-2 h-2 rounded-full bg-[#C8A27B]"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A] m-0">
                    New inquiry submitted
                  </p>
                  <p className="text-xs text-[#6B4423] m-0">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="coffee-card hover-lift">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A2F19]" />
            Popular Courses
          </h3>
          <div className="space-y-3">
            {["Barista Basics", "Latte Art Mastery", "Coffee Roasting"].map(
              (course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#EFE7D3]/50 rounded-lg border border-[#C8A27B]/20"
                >
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {course}
                  </span>
                  <span className="badge-coffee text-[#4A2F19]">
                    {42 - index * 8} students
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
