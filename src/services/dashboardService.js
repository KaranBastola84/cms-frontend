import api from "../config/api";

const dashboardService = {
  // Get dashboard overview data
  getOverview: async () => {
    try {
      const response = await api.get("/api/Dashboard/overview");
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") || "Failed to fetch overview",
      );
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  // Get financial data
  getFinancial: async () => {
    try {
      const response = await api.get("/api/Dashboard/financial");
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") ||
          "Failed to fetch financial data",
      );
    } catch (error) {
      console.error("Error fetching financial data:", error);
      throw error;
    }
  },

  // Get activities data
  getActivities: async () => {
    try {
      const response = await api.get("/api/Dashboard/activities");
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") || "Failed to fetch activities",
      );
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  // Get alerts data
  getAlerts: async () => {
    try {
      const response = await api.get("/api/Dashboard/alerts");
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") || "Failed to fetch alerts",
      );
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  },

  // Get charts data
  getCharts: async () => {
    try {
      const response = await api.get("/api/Dashboard/charts");
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") || "Failed to fetch charts data",
      );
    } catch (error) {
      console.error("Error fetching charts data:", error);
      throw error;
    }
  },

  // Get attendance data
  getAttendance: async () => {
    try {
      const response = await api.get("/api/Dashboard/attendance");
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") ||
          "Failed to fetch attendance data",
      );
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (limit = 50) => {
    try {
      const response = await api.get(
        `/api/Dashboard/notifications?limit=${limit}`,
      );
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(
        response.data.errorMessage?.join(", ") ||
          "Failed to fetch notifications",
      );
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
      const response = await api.get("/api/dashboard/search", {
        params: {
          q: query,
          limit,
        },
      });

      if (response.data.isSuccess) {
        return response.data.result;
      }

      throw new Error(
        response.data.errorMessage?.join(", ") ||
          "Failed to search dashboard data",
      );
    } catch (error) {
      console.error("Error searching dashboard data:", error);
      throw error;
    }
  },
};

export default dashboardService;
