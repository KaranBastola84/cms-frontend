import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  CalendarClock,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  OVERVIEW_LIMIT_OPTIONS,
  TIMELINE_LIMIT_OPTIONS,
  formatDateTime,
} from "../../../utils/dashboardHelpers";
import useRoleDashboard from "../../../hooks/useRoleDashboard";
import dashboardService from "../../../services/dashboardService";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatPercentage = (value) => {
  return `${Number(value || 0).toFixed(2)}%`;
};

const normalizeTrainerTimelineActionUrl = (actionUrl) => {
  if (!actionUrl) return "";

  if (actionUrl.startsWith("/trainer/attendance")) {
    return actionUrl.replace("/trainer/attendance", "/admin/attendance");
  }

  if (actionUrl.startsWith("/trainer/students/")) {
    return "/staff/students";
  }

  if (actionUrl.startsWith("/trainer/batches/")) {
    return "/admin/batch-schedule";
  }

  return actionUrl;
};

const getTimelineBadgeClass = (eventType) => {
  switch (eventType) {
    case "attendance":
      return "bg-emerald-100 text-emerald-800";
    case "student":
      return "bg-blue-100 text-blue-800";
    case "batch":
      return "bg-purple-100 text-purple-800";
    case "payment":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

function TrainerDashboard() {
  const [overviewLimit, setOverviewLimit] = useState(5);
  const [timelineLimit, setTimelineLimit] = useState(20);
  const {
    loading,
    refreshing,
    error,
    lastUpdated,
    pollingPaused,
    overview,
    quickActions,
    timeline,
    sectionLoading,
    fetchDashboard,
  } = useRoleDashboard({
    overviewLimit,
    timelineLimit,
    getOverview: dashboardService.getTrainerOverview,
    getQuickActions: dashboardService.getTrainerQuickActions,
    getTimeline: dashboardService.getTrainerTimeline,
    loadErrorMessage: "Failed to load trainer dashboard",
  });

  const summary = useMemo(() => overview?.summary || {}, [overview]);
  const attendanceToday = overview?.attendanceToday || {};
  const activeBatches = overview?.activeBatches || [];
  const upcomingBatches = overview?.upcomingBatches || [];
  const recentStudents = overview?.recentStudents || [];

  const stats = useMemo(
    () => [
      {
        label: "Assigned Batches",
        value: summary.assignedBatches || 0,
        icon: BookOpen,
      },
      {
        label: "Active Batches",
        value: summary.activeBatches || 0,
        icon: Activity,
      },
      {
        label: "Starts Next 7 Days",
        value: summary.upcomingBatchesNext7Days || 0,
        icon: CalendarClock,
      },
      {
        label: "Students in My Batches",
        value: summary.totalStudentsInMyBatches || 0,
        icon: Users,
      },
      {
        label: "Students Marked Today",
        value: summary.studentsMarkedToday || 0,
        icon: ClipboardCheck,
      },
      {
        label: "Attendance Rate (7 Days)",
        value: formatPercentage(summary.attendanceRateLast7Days),
        icon: TrendingUp,
      },
    ],
    [summary],
  );

  const quickActionItems = useMemo(
    () => [
      {
        label: "Active Batches Today",
        value: quickActions?.activeBatchesToday || 0,
      },
      {
        label: "Unmarked Batches Today",
        value: quickActions?.unmarkedActiveBatchesToday || 0,
      },
      {
        label: "Students to Mark Today",
        value: quickActions?.studentsToMarkToday || 0,
      },
      {
        label: "Attendance Marked Today",
        value: quickActions?.attendanceMarkedToday || 0,
      },
      {
        label: "Batches Starting in 3 Days",
        value: quickActions?.upcomingBatchesNext3Days || 0,
      },
      {
        label: "New Students This Week",
        value: quickActions?.newStudentsThisWeek || 0,
      },
    ],
    [quickActions],
  );

  if (
    !loading &&
    error &&
    !overview &&
    !quickActions &&
    timeline.length === 0
  ) {
    return (
      <div className="rounded-2xl bg-white border border-red-200 p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-red-900 m-0 mb-2">
          Trainer dashboard unavailable
        </h2>
        <p className="text-red-700 m-0 mb-4">{error}</p>
        <button
          onClick={() => fetchDashboard()}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#3D2817] m-0">
              Trainer Dashboard
            </h1>
            <p className="text-[#8B6F47] mt-2 m-0">
              Live view of your batches, attendance flow, and recent student
              activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-[#6B4423] font-semibold">
              Overview Limit
            </label>
            <select
              value={overviewLimit}
              onChange={(e) => setOverviewLimit(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-[#E5D4BC] bg-white"
            >
              {OVERVIEW_LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="text-sm text-[#6B4423] font-semibold ml-2">
              Timeline Limit
            </label>
            <select
              value={timelineLimit}
              onChange={(e) => setTimelineLimit(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-[#E5D4BC] bg-white"
            >
              {TIMELINE_LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchDashboard({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A2F19] text-white hover:bg-[#3D2817] disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>

            <p className="text-xs text-[#8B6F47] m-0 w-full lg:w-auto lg:ml-2">
              {pollingPaused
                ? "Auto-refresh paused (tab inactive)"
                : "Auto-refresh every 60s"}
              {lastUpdated
                ? ` • Last sync ${new Date(lastUpdated).toLocaleTimeString()}`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!sectionLoading.overview && (summary.assignedBatches || 0) === 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 text-sm">
          No batches are currently assigned to this trainer. Metrics and feeds
          will populate automatically once assignments are added.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sectionLoading.overview
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`stats-skeleton-${index}`}
                className="bg-white rounded-xl border border-[#E8DCC8] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="h-4 w-32 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-5 w-5 rounded bg-[#EFE4D3] animate-pulse"></div>
                </div>
                <div className="h-8 w-24 mt-3 rounded bg-[#EFE4D3] animate-pulse"></div>
              </div>
            ))
          : stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white rounded-xl border border-[#E8DCC8] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-[#8B6F47] font-semibold m-0">
                      {item.label}
                    </p>
                    <Icon className="w-5 h-5 text-[#4A2F19]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2C1C14] mt-3 mb-0">
                    {item.value}
                  </p>
                </div>
              );
            })}
      </div>

      <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#4A2F19]" />
          <h2 className="text-lg font-bold text-[#2C1C14] m-0">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectionLoading.quickActions
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`quick-skeleton-${index}`}
                  className="rounded-lg border border-[#EDE1CF] bg-[#FFFDF9] px-3 py-3"
                >
                  <div className="h-3 w-28 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-7 w-16 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                </div>
              ))
            : quickActionItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-[#EDE1CF] bg-[#FFFDF9] px-3 py-3"
                >
                  <p className="text-xs text-[#8B6F47] font-semibold m-0">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold text-[#2C1C14] mt-2 mb-0">
                    {item.value}
                  </p>
                </div>
              ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-[#4A2F19]" />
            <h3 className="text-lg font-bold text-[#2C1C14] m-0">
              Attendance Today
            </h3>
          </div>

          {sectionLoading.overview ? (
            <div className="space-y-3">
              <div className="h-4 w-32 rounded bg-[#EFE4D3] animate-pulse"></div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`attendance-skeleton-${index}`}
                  className="h-4 rounded bg-[#EFE4D3] animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-[#8B6F47] m-0 mb-3">
                {formatDate(attendanceToday.date)}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B4423]">Marked</span>
                  <span className="font-semibold text-[#2C1C14]">
                    {attendanceToday.totalMarked || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4423]">Present</span>
                  <span className="font-semibold text-green-700">
                    {attendanceToday.present || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4423]">Absent</span>
                  <span className="font-semibold text-red-700">
                    {attendanceToday.absent || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4423]">Late</span>
                  <span className="font-semibold text-amber-700">
                    {attendanceToday.late || 0}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#EEE1CE] pt-2 mt-2">
                  <span className="text-[#6B4423] font-semibold">Rate</span>
                  <span className="font-bold text-[#2C1C14]">
                    {formatPercentage(attendanceToday.attendanceRate)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C1C14] m-0 mb-4">
            Active Batches
          </h3>

          <div className="space-y-3">
            {sectionLoading.overview ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`active-batch-skeleton-${index}`}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <div className="h-4 w-36 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-3 w-44 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-3 w-52 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                </div>
              ))
            ) : activeBatches.length === 0 ? (
              <p className="text-sm text-[#8B6F47] m-0">No active batches.</p>
            ) : (
              activeBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <p className="font-semibold text-[#2C1C14] m-0">
                    {batch.batchName}
                  </p>
                  <p className="text-sm text-[#6B4423] m-0 mt-1">
                    {batch.courseName}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Slot: {batch.timeSlot || "-"}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Duration: {formatDate(batch.startDate)} -{" "}
                    {formatDate(batch.endDate)}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Students: {batch.totalStudents || 0}/{batch.capacity || 0}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C1C14] m-0 mb-4">
            Upcoming Batches
          </h3>

          <div className="space-y-3">
            {sectionLoading.overview ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`upcoming-batch-skeleton-${index}`}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <div className="h-4 w-36 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-3 w-44 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-3 w-32 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                </div>
              ))
            ) : upcomingBatches.length === 0 ? (
              <p className="text-sm text-[#8B6F47] m-0">No upcoming batches.</p>
            ) : (
              upcomingBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <p className="font-semibold text-[#2C1C14] m-0">
                    {batch.batchName}
                  </p>
                  <p className="text-sm text-[#6B4423] m-0 mt-1">
                    {batch.courseName}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Slot: {batch.timeSlot || "-"}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Starts: {formatDate(batch.startDate)} (
                    {batch.daysUntilStart ?? 0} day(s))
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C1C14] m-0 mb-4">
            Recently Added Students
          </h3>

          <div className="space-y-3">
            {sectionLoading.overview ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`recent-student-skeleton-${index}`}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <div className="h-4 w-32 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-3 w-44 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                  <div className="h-3 w-52 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                </div>
              ))
            ) : recentStudents.length === 0 ? (
              <p className="text-sm text-[#8B6F47] m-0">No recent students.</p>
            ) : (
              recentStudents.map((student) => (
                <div
                  key={student.studentId}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <p className="font-semibold text-[#2C1C14] m-0">
                    {student.studentName}
                  </p>
                  <p className="text-sm text-[#6B4423] m-0 mt-1">
                    {student.batchName}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    {student.courseName}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Added: {formatDateTime(student.createdAt)} •{" "}
                    {student.status || "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C1C14] m-0 mb-4">
            Batch Snapshot
          </h3>

          {sectionLoading.overview ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`snapshot-skeleton-${index}`}
                  className="h-4 rounded bg-[#EFE4D3] animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B4423]">Assigned Batches</span>
                <span className="font-semibold text-[#2C1C14]">
                  {summary.assignedBatches || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B4423]">Active Batches</span>
                <span className="font-semibold text-[#2C1C14]">
                  {summary.activeBatches || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B4423]">Upcoming (7 Days)</span>
                <span className="font-semibold text-[#2C1C14]">
                  {summary.upcomingBatchesNext7Days || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B4423]">Students in Batches</span>
                <span className="font-semibold text-[#2C1C14]">
                  {summary.totalStudentsInMyBatches || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B4423]">Marked Today</span>
                <span className="font-semibold text-[#2C1C14]">
                  {summary.studentsMarkedToday || 0}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#EEE1CE] pt-2 mt-2">
                <span className="text-[#6B4423] font-semibold">
                  7-Day Attendance Rate
                </span>
                <span className="font-bold text-[#2C1C14]">
                  {formatPercentage(summary.attendanceRateLast7Days)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[#2C1C14] m-0 mb-4">
          Latest Timeline
        </h3>

        <div className="space-y-3">
          {sectionLoading.timeline ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`timeline-skeleton-${index}`}
                className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
              >
                <div className="h-4 w-52 rounded bg-[#EFE4D3] animate-pulse"></div>
                <div className="h-3 w-64 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
                <div className="h-3 w-36 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
              </div>
            ))
          ) : timeline.length === 0 ? (
            <p className="text-sm text-[#8B6F47] m-0">
              No timeline events available.
            </p>
          ) : (
            timeline.map((event, index) => {
              const normalizedActionUrl = normalizeTrainerTimelineActionUrl(
                event.actionUrl,
              );

              return (
                <div
                  key={`${event.eventType || "event"}-${event.timestamp || index}`}
                  className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getTimelineBadgeClass(event.eventType)}`}
                      >
                        {(event.eventType || "other").toUpperCase()}
                      </span>
                      <span className="text-xs text-[#8B6F47]">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>

                    {normalizedActionUrl && (
                      <Link
                        to={normalizedActionUrl}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#4A2F19] hover:text-[#3D2817]"
                      >
                        Open
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  <p className="font-semibold text-[#2C1C14] m-0 mt-2">
                    {event.title}
                  </p>
                  <p className="text-sm text-[#6B4423] m-0 mt-1">
                    {event.description || "-"}
                  </p>
                  <p className="text-xs text-[#8B6F47] m-0 mt-1">
                    Status: {event.status || "-"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboard;
