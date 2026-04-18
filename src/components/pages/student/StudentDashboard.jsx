import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  OVERVIEW_LIMIT_OPTIONS,
  TIMELINE_LIMIT_OPTIONS,
  formatDateTime,
  isDisplayPrimitive,
} from "../../../utils/dashboardHelpers";
import useRoleDashboard from "../../../hooks/useRoleDashboard";
import dashboardService from "../../../services/dashboardService";

const TITLE_KEYS = [
  "title",
  "name",
  "label",
  "courseName",
  "batchName",
  "description",
  "receiptNumber",
];

const TIMESTAMP_KEYS = [
  "timestamp",
  "createdAt",
  "updatedAt",
  "date",
  "dueDate",
  "startDate",
  "paymentDate",
];

const STATUS_KEYS = ["status", "state", "paymentStatus"];
const TITLE_KEY_SET = new Set(TITLE_KEYS);
const TIMESTAMP_KEY_SET = new Set(TIMESTAMP_KEYS);
const STATUS_KEY_SET = new Set(STATUS_KEYS);

const toLabel = (value) => {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

const formatValue = (value) => {
  if (value === null || typeof value === "undefined") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
};

const getFirstValueByKeys = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== null && typeof value !== "undefined" && value !== "") {
      return value;
    }
  }
  return null;
};

const normalizeStudentTimelineActionUrl = (actionUrl) => {
  if (!actionUrl || typeof actionUrl !== "string") return "";
  if (!actionUrl.startsWith("/")) return "";

  if (actionUrl.startsWith("/student/payments")) {
    return "/admin/finance/payment-plans";
  }

  if (actionUrl.startsWith("/student/receipts")) {
    return "/student/dashboard";
  }

  if (actionUrl.startsWith("/student/courses")) {
    return "/student/dashboard";
  }

  return actionUrl;
};

const getTimelineBadgeClass = (eventType) => {
  switch (String(eventType || "").toLowerCase()) {
    case "payment":
      return "bg-emerald-100 text-emerald-800";
    case "course":
      return "bg-blue-100 text-blue-800";
    case "attendance":
      return "bg-amber-100 text-amber-800";
    case "notification":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

function StudentDashboard() {
  const { user } = useAuth();
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
    getOverview: dashboardService.getStudentOverview,
    getQuickActions: dashboardService.getStudentQuickActions,
    getTimeline: dashboardService.getStudentTimeline,
    loadErrorMessage: "Failed to load student dashboard",
  });

  const { summaryCards, detailItems, listSections } = useMemo(() => {
    if (!overview || typeof overview !== "object") {
      return {
        summaryCards: [],
        detailItems: [],
        listSections: [],
      };
    }

    const source =
      overview.summary && typeof overview.summary === "object"
        ? overview.summary
        : overview;

    const summaryCards = [];
    for (const [key, value] of Object.entries(source)) {
      if (!isDisplayPrimitive(value)) continue;
      summaryCards.push({
        key,
        label: toLabel(key),
        value: formatValue(value),
      });

      if (summaryCards.length === 8) {
        break;
      }
    }

    const detailItems = [];
    const listSections = [];

    for (const [key, value] of Object.entries(overview)) {
      if (key === "summary") continue;

      if (Array.isArray(value)) {
        listSections.push({
          key,
          label: toLabel(key),
          items: value,
        });
        continue;
      }

      if (isDisplayPrimitive(value)) {
        detailItems.push({
          key,
          label: toLabel(key),
          value: formatValue(value),
        });
      }
    }

    return {
      summaryCards,
      detailItems,
      listSections,
    };
  }, [overview]);

  const quickActionItems = useMemo(() => {
    if (!quickActions || typeof quickActions !== "object") return [];

    return Object.entries(quickActions)
      .filter(([, value]) => isDisplayPrimitive(value))
      .map(([key, value]) => ({
        key,
        label: toLabel(key),
        value: formatValue(value),
      }));
  }, [quickActions]);

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
          Student dashboard unavailable
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
              Welcome back, {user?.name || "Student"}
            </h1>
            <p className="text-[#8B6F47] mt-2 m-0">
              Track your student progress, actions, and latest updates.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {sectionLoading.overview ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`summary-skeleton-${index}`}
              className="bg-white rounded-xl border border-[#E8DCC8] p-4 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-[#EFE4D3] animate-pulse"></div>
              <div className="h-8 w-20 mt-3 rounded bg-[#EFE4D3] animate-pulse"></div>
            </div>
          ))
        ) : summaryCards.length > 0 ? (
          summaryCards.map((item, index) => (
            <div
              key={item.key}
              className="bg-white rounded-xl border border-[#E8DCC8] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-[#8B6F47] font-semibold m-0">
                  {item.label}
                </p>
                {index % 4 === 0 && (
                  <BookOpen className="w-5 h-5 text-[#4A2F19]" />
                )}
                {index % 4 === 1 && (
                  <CreditCard className="w-5 h-5 text-[#4A2F19]" />
                )}
                {index % 4 === 2 && (
                  <Calendar className="w-5 h-5 text-[#4A2F19]" />
                )}
                {index % 4 === 3 && (
                  <FileText className="w-5 h-5 text-[#4A2F19]" />
                )}
              </div>
              <p className="text-2xl font-bold text-[#2C1C14] mt-3 mb-0">
                {item.value}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-[#E8DCC8] p-4 shadow-sm sm:col-span-2 xl:col-span-4">
            <p className="text-sm text-[#8B6F47] m-0">
              No summary metrics available.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#4A2F19]" />
          <h2 className="text-lg font-bold text-[#2C1C14] m-0">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectionLoading.quickActions ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`quick-skeleton-${index}`}
                className="rounded-lg border border-[#EDE1CF] bg-[#FFFDF9] px-3 py-3"
              >
                <div className="h-3 w-28 rounded bg-[#EFE4D3] animate-pulse"></div>
                <div className="h-7 w-16 mt-2 rounded bg-[#EFE4D3] animate-pulse"></div>
              </div>
            ))
          ) : quickActionItems.length > 0 ? (
            quickActionItems.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-[#EDE1CF] bg-[#FFFDF9] px-3 py-3"
              >
                <p className="text-xs text-[#8B6F47] font-semibold m-0">
                  {item.label}
                </p>
                <p className="text-xl font-bold text-[#2C1C14] mt-2 mb-0">
                  {item.value}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-[#EDE1CF] bg-[#FFFDF9] px-3 py-3 lg:col-span-3">
              <p className="text-sm text-[#8B6F47] m-0">
                No quick action data available.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C1C14] m-0 mb-4">
            Overview Details
          </h3>

          {sectionLoading.overview ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`details-skeleton-${index}`}
                  className="h-4 rounded bg-[#EFE4D3] animate-pulse"
                ></div>
              ))}
            </div>
          ) : detailItems.length > 0 ? (
            <div className="space-y-2 text-sm">
              {detailItems.map((item) => (
                <div key={item.key} className="flex justify-between gap-4">
                  <span className="text-[#6B4423]">{item.label}</span>
                  <span className="font-semibold text-[#2C1C14] text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8B6F47] m-0">
              No additional overview details available.
            </p>
          )}
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
                const normalizedActionUrl = normalizeStudentTimelineActionUrl(
                  event?.actionUrl,
                );

                return (
                  <div
                    key={`${event?.eventType || "event"}-${event?.timestamp || index}`}
                    className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getTimelineBadgeClass(event?.eventType)}`}
                        >
                          {String(event?.eventType || "other").toUpperCase()}
                        </span>
                        <span className="text-xs text-[#8B6F47]">
                          {formatDateTime(event?.timestamp)}
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
                      {event?.title || event?.message || "Update"}
                    </p>
                    <p className="text-sm text-[#6B4423] m-0 mt-1">
                      {event?.description || "-"}
                    </p>
                    <p className="text-xs text-[#8B6F47] m-0 mt-1">
                      Status: {event?.status || "-"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {listSections.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {listSections.map((section, sectionIndex) => (
            <div
              key={section.key}
              className="bg-white rounded-xl border border-[#E8DCC8] p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                {sectionIndex % 2 === 0 ? (
                  <BookOpen className="w-5 h-5 text-[#4A2F19]" />
                ) : (
                  <User className="w-5 h-5 text-[#4A2F19]" />
                )}
                <h3 className="text-lg font-bold text-[#2C1C14] m-0">
                  {section.label}
                </h3>
              </div>

              <div className="space-y-3">
                {section.items.length === 0 ? (
                  <p className="text-sm text-[#8B6F47] m-0">
                    No items available.
                  </p>
                ) : (
                  section.items
                    .slice(0, overviewLimit)
                    .map((item, itemIndex) => {
                      const safeItem =
                        item && typeof item === "object" ? item : {};
                      const title = getFirstValueByKeys(safeItem, TITLE_KEYS);
                      const timestamp = getFirstValueByKeys(
                        safeItem,
                        TIMESTAMP_KEYS,
                      );
                      const status = getFirstValueByKeys(safeItem, STATUS_KEYS);

                      const extraFields = Object.entries(safeItem)
                        .filter(([key, value]) => {
                          if (TITLE_KEY_SET.has(key)) return false;
                          if (TIMESTAMP_KEY_SET.has(key)) return false;
                          if (STATUS_KEY_SET.has(key)) return false;
                          return isDisplayPrimitive(value);
                        })
                        .slice(0, 3);

                      return (
                        <div
                          key={safeItem.id || safeItem.key || itemIndex}
                          className="rounded-lg border border-[#EEE1CE] p-3 bg-[#FFFDF9]"
                        >
                          <p className="font-semibold text-[#2C1C14] m-0">
                            {title || `${section.label} ${itemIndex + 1}`}
                          </p>

                          {timestamp && (
                            <p className="text-xs text-[#8B6F47] m-0 mt-1">
                              {formatDateTime(timestamp)}
                            </p>
                          )}

                          {status && (
                            <p className="text-xs text-[#8B6F47] m-0 mt-1">
                              Status: {formatValue(status)}
                            </p>
                          )}

                          {extraFields.map(([key, value]) => (
                            <p
                              key={key}
                              className="text-xs text-[#6B4423] m-0 mt-1"
                            >
                              {toLabel(key)}: {formatValue(value)}
                            </p>
                          ))}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
