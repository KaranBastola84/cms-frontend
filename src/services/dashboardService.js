import api from '../config/api';

const dashboardService = {
  // Get dashboard overview data
  getOverview: async () => {
    try {
      const response = await api.get('/api/Dashboard/overview');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch overview');
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Get financial data
  getFinancial: async () => {
    try {
      const response = await api.get('/api/Dashboard/financial');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch financial data');
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  },

  // Get activities data
  getActivities: async () => {
    try {
      const response = await api.get('/api/Dashboard/activities');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch activities');
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  // Get alerts data
  getAlerts: async () => {
    try {
      const response = await api.get('/api/Dashboard/alerts');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch alerts');
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Get charts data
  getCharts: async () => {
    try {
      const response = await api.get('/api/Dashboard/charts');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch charts data');
    } catch (error) {
      console.error('Error fetching charts data:', error);
      throw error;
    }
  },

  // Get attendance data
  getAttendance: async () => {
    try {
      const response = await api.get('/api/Dashboard/attendance');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch attendance data');
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (limit = 50) => {
    try {
      const response = await api.get(`/api/Dashboard/notifications?limit=${limit}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
};

export default dashboardService;
