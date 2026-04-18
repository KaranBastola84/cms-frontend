import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getReadableError } from "../utils/dashboardHelpers";

const createInitialSectionLoading = () => ({
  overview: true,
  quickActions: true,
  timeline: true,
});

const createCompletedSectionLoading = () => ({
  overview: false,
  quickActions: false,
  timeline: false,
});

const toTimelineArray = (value) => {
  return Array.isArray(value) ? value : [];
};

function useRoleDashboard({
  overviewLimit,
  timelineLimit,
  getOverview,
  getQuickActions,
  getTimeline,
  loadErrorMessage,
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pollingPaused, setPollingPaused] = useState(false);
  const [overview, setOverview] = useState(null);
  const [quickActions, setQuickActions] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(
    createInitialSectionLoading,
  );

  const fetchDashboard = useCallback(
    async ({
      silent = false,
      pollOnly = false,
      suppressToast = false,
    } = {}) => {
      if (silent) {
        setRefreshing(true);
      }

      if (!pollOnly && !silent) {
        setLoading(true);
      }

      if (pollOnly) {
        setSectionLoading((prev) => ({
          ...prev,
          quickActions: true,
          timeline: true,
        }));
      } else {
        setError("");
        setSectionLoading(createInitialSectionLoading());
      }

      try {
        if (pollOnly) {
          const [quickActionsResult, timelineResult] = await Promise.allSettled(
            [getQuickActions(), getTimeline(timelineLimit)],
          );

          const errors = [];
          let hasSuccess = false;

          if (quickActionsResult.status === "fulfilled") {
            setQuickActions(quickActionsResult.value || null);
            hasSuccess = true;
          } else {
            errors.push(
              getReadableError(
                quickActionsResult.reason,
                "Failed to refresh quick actions",
              ),
            );
          }

          if (timelineResult.status === "fulfilled") {
            setTimeline(toTimelineArray(timelineResult.value));
            hasSuccess = true;
          } else {
            errors.push(
              getReadableError(
                timelineResult.reason,
                "Failed to refresh timeline",
              ),
            );
          }

          if (hasSuccess) {
            setLastUpdated(new Date());
          }

          if (errors.length > 0 && !suppressToast) {
            toast.error(errors[0]);
          }

          return;
        }

        const [overviewResult, quickActionsResult, timelineResult] =
          await Promise.allSettled([
            getOverview(overviewLimit),
            getQuickActions(),
            getTimeline(timelineLimit),
          ]);

        const errors = [];
        let hasSuccess = false;

        if (overviewResult.status === "fulfilled") {
          setOverview(overviewResult.value || null);
          hasSuccess = true;
        } else {
          errors.push(
            getReadableError(
              overviewResult.reason,
              "Failed to load overview data",
            ),
          );
        }

        if (quickActionsResult.status === "fulfilled") {
          setQuickActions(quickActionsResult.value || null);
          hasSuccess = true;
        } else {
          errors.push(
            getReadableError(
              quickActionsResult.reason,
              "Failed to load quick actions",
            ),
          );
        }

        if (timelineResult.status === "fulfilled") {
          setTimeline(toTimelineArray(timelineResult.value));
          hasSuccess = true;
        } else {
          errors.push(
            getReadableError(timelineResult.reason, "Failed to load timeline"),
          );
        }

        if (hasSuccess) {
          setError("");
          setLastUpdated(new Date());
        }

        if (errors.length > 0) {
          const firstError = errors[0];
          setError(firstError);
          if (!suppressToast) {
            toast.error(firstError);
          }
        }
      } catch (err) {
        const message = getReadableError(err, loadErrorMessage);
        if (!pollOnly) {
          setError(message);
        }
        if (!suppressToast) {
          toast.error(message);
        }
      } finally {
        if (!pollOnly && !silent) {
          setLoading(false);
        }
        if (silent) {
          setRefreshing(false);
        }
        if (pollOnly) {
          setSectionLoading((prev) => ({
            ...prev,
            quickActions: false,
            timeline: false,
          }));
        } else {
          setSectionLoading(createCompletedSectionLoading());
        }
      }
    },
    [
      getOverview,
      getQuickActions,
      getTimeline,
      loadErrorMessage,
      overviewLimit,
      timelineLimit,
    ],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    let intervalId = null;

    const clearPolling = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startPolling = () => {
      if (intervalId !== null) return;

      intervalId = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchDashboard({ pollOnly: true, suppressToast: true });
        }
      }, 60000);
    };

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setPollingPaused(!isVisible);

      if (isVisible) {
        fetchDashboard({ pollOnly: true, suppressToast: true });
        startPolling();
      } else {
        clearPolling();
      }
    };

    const handleWindowFocus = () => {
      if (document.visibilityState === "visible") {
        setPollingPaused(false);
        fetchDashboard({ pollOnly: true, suppressToast: true });
        startPolling();
      }
    };

    if (document.visibilityState === "visible") {
      setPollingPaused(false);
      startPolling();
    } else {
      setPollingPaused(true);
      clearPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchDashboard]);

  return {
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
  };
}

export default useRoleDashboard;
