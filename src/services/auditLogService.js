import api from '../config/api';

const auditLogService = {
  // Get all audit logs
  getAll: async () => {
    try {
      const response = await api.get('/api/AuditLog');
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch audit logs');
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // Get audit logs by user ID
  getByUser: async (userId) => {
    try {
      const response = await api.get(`/api/AuditLog/user/${userId}`);
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch user audit logs');
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      throw error;
    }
  },

  // Get audit logs by module
  getByModule: async (module) => {
    try {
      const response = await api.get(`/api/AuditLog/module/${module}`);
      if (response.data.isSuccess) {
        return response.data.result;
      }
      throw new Error(response.data.errorMessage?.join(', ') || 'Failed to fetch module audit logs');
    } catch (error) {
      console.error('Error fetching module audit logs:', error);
      throw error;
    }
  },
};

export default auditLogService;
