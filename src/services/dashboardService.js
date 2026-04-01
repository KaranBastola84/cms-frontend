import api from "../config/api";

const getErrorMessage = (responseData, fallbackMessage) => {
  return responseData?.errorMessage?.join(", ") || fallbackMessage;
};

const ensureSuccess = (response, fallbackMessage) => {
  if (response.data.isSuccess) {
    return response.data.result;
  }

  throw new Error(getErrorMessage(response.data, fallbackMessage));
};

const clampLimit = (limit, min, max, fallback) => {
  const numericLimit = Number(limit);
  if (!Number.isFinite(numericLimit)) return fallback;
  return Math.min(Math.max(Math.trunc(numericLimit), min), max);
};

const dashboardService = {
  // Get dashboard overview data
  getOverview: async () => {
    try {
      const response = await api.get("/api/Dashboard/overview");
      return ensureSuccess(response, "Failed to fetch overview");
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  // Get financial data
  getFinancial: async () => {
    try {
      const response = await api.get("/api/Dashboard/financial");
      return ensureSuccess(response, "Failed to fetch financial data");
    } catch (error) {
      console.error("Error fetching financial data:", error);
      throw error;
    }
  },

  // Get activities data
  getActivities: async () => {
    try {
      const response = await api.get("/api/Dashboard/activities");
      return ensureSuccess(response, "Failed to fetch activities");
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  // Get alerts data
  getAlerts: async () => {
    try {
      const response = await api.get("/api/Dashboard/alerts");
      return ensureSuccess(response, "Failed to fetch alerts");
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  },

  // Get charts data
  getCharts: async () => {
    try {
      const response = await api.get("/api/Dashboard/charts");
      return ensureSuccess(response, "Failed to fetch charts data");
    } catch (error) {
      console.error("Error fetching charts data:", error);
      throw error;
    }
  },

  // Get attendance data
  getAttendance: async () => {
    try {
      const response = await api.get("/api/Dashboard/attendance");
      return ensureSuccess(response, "Failed to fetch attendance data");
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (limit = 50) => {
    try {
      const safeLimit = clampLimit(limit, 1, 100, 50);
      const response = await api.get(
        `/api/Dashboard/notifications?limit=${safeLimit}`,
      );
      return ensureSuccess(response, "Failed to fetch notifications");
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Mark a single notification as read
  markNotificationAsRead: async (notificationKey) => {
    try {
      const response = await api.post(
        "/api/Dashboard/notifications/mark-read",
        {
          notificationKey,
        },
      );
      // Handle both 'success' and 'isSuccess' fields
      if (response.data.success === true || response.data.isSuccess === true) {
        return response.data.result;
      }
      console.error("Mark notification as read response:", response.data);
      throw new Error(
        response.data.errorMessage?.join(", ") ||
          response.data.message ||
          "Failed to mark notification as read",
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.post(
        "/api/Dashboard/notifications/mark-all-read",
      );
      // Handle both 'success' and 'isSuccess' fields
      if (response.data.success === true || response.data.isSuccess === true) {
        // Backend returns message in errorMessage array
        const message =
          response.data.errorMessage?.[0] ||
          response.data.message ||
          "All notifications marked as read";
        return {
          ...response.data,
          message,
        };
      }
      console.error("Mark all notifications as read response:", response.data);
      throw new Error(
        response.data.message ||
          response.data.errorMessage?.join(", ") ||
          "Failed to mark all notifications as read",
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  // Global admin dashboard search
  globalSearch: async (query, limit = 15) => {
    try {
      const safeLimit = clampLimit(limit, 1, 100, 15);
      const response = await api.get("/api/dashboard/search", {
        params: {
          q: query,
          limit: safeLimit,
        },
      });

      return ensureSuccess(response, "Failed to search dashboard data");
    } catch (error) {
      console.error("Error searching dashboard data:", error);
      throw error;
    }
  },

  // Get staff dashboard overview with operational sections
  getStaffOverview: async (limit = 5) => {
    try {
      const safeLimit = clampLimit(limit, 1, 20, 5);
      const response = await api.get("/api/Dashboard/staff/overview", {
        params: { limit: safeLimit },
      });
      return ensureSuccess(response, "Failed to fetch staff overview");
    } catch (error) {
      console.error("Error fetching staff overview:", error);
      throw error;
    }
  },

  // Get staff quick-action counters
  getStaffQuickActions: async () => {
    try {
      const response = await api.get("/api/Dashboard/staff/quick-actions");
      return ensureSuccess(response, "Failed to fetch staff quick actions");
    } catch (error) {
      console.error("Error fetching staff quick actions:", error);
      throw error;
    }
  },

  // Get staff operational timeline
  getStaffTimeline: async (limit = 20) => {
    try {
      const safeLimit = clampLimit(limit, 1, 100, 20);
      const response = await api.get("/api/Dashboard/staff/timeline", {
        params: { limit: safeLimit },
      });
      return ensureSuccess(response, "Failed to fetch staff timeline");
    } catch (error) {
      console.error("Error fetching staff timeline:", error);
      throw error;
    }
  },

  // Get trainer dashboard overview with operational sections
  getTrainerOverview: async (limit = 5) => {
    try {
      const safeLimit = clampLimit(limit, 1, 20, 5);
      const response = await api.get("/api/Dashboard/trainer/overview", {
        params: { limit: safeLimit },
      });
      return ensureSuccess(response, "Failed to fetch trainer overview");
    } catch (error) {
      console.error("Error fetching trainer overview:", error);
      throw error;
    }
  },

  // Get trainer quick-action counters
  getTrainerQuickActions: async () => {
    try {
      const response = await api.get("/api/Dashboard/trainer/quick-actions");
      return ensureSuccess(response, "Failed to fetch trainer quick actions");
    } catch (error) {
      console.error("Error fetching trainer quick actions:", error);
      throw error;
    }
  },

  // Get trainer timeline feed
  getTrainerTimeline: async (limit = 20) => {
    try {
      const safeLimit = clampLimit(limit, 1, 100, 20);
      const response = await api.get("/api/Dashboard/trainer/timeline", {
        params: { limit: safeLimit },
      });
      return ensureSuccess(response, "Failed to fetch trainer timeline");
    } catch (error) {
      console.error("Error fetching trainer timeline:", error);
      throw error;
    }
  },

  // Get student dashboard overview
  getStudentOverview: async (limit = 5) => {
    try {
      const safeLimit = clampLimit(limit, 1, 20, 5);
      const response = await api.get("/api/Dashboard/student/overview", {
        params: { limit: safeLimit },
      });
      return ensureSuccess(response, "Failed to fetch student overview");
    } catch (error) {
      console.error("Error fetching student overview:", error);
      throw error;
    }
  },

  // Get student quick-action counters
  getStudentQuickActions: async () => {
    try {
      const response = await api.get("/api/Dashboard/student/quick-actions");
      return ensureSuccess(response, "Failed to fetch student quick actions");
    } catch (error) {
      console.error("Error fetching student quick actions:", error);
      throw error;
    }
  },

  // Get student timeline feed
  getStudentTimeline: async (limit = 20) => {
    try {
      const safeLimit = clampLimit(limit, 1, 100, 20);
      const response = await api.get("/api/Dashboard/student/timeline", {
        params: { limit: safeLimit },
      });
      return ensureSuccess(response, "Failed to fetch student timeline");
    } catch (error) {
      console.error("Error fetching student timeline:", error);
      throw error;
    }
  },
};

export default dashboardService;
