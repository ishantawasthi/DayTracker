import api from './client';

export const taskApi = {
  getTasks: async (params = {}) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },
  getDashboardSummary: async (date) => {
    const res = await api.get('/tasks/dashboard-summary', { params: { date } });
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },
  updateTask: async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },
  toggleTask: async (id) => {
    const res = await api.patch(`/tasks/${id}/toggle`);
    return res.data;
  },
  rescheduleTask: async (id, scheduledDate, scheduledTime) => {
    const res = await api.patch(`/tasks/${id}/reschedule`, { scheduledDate, scheduledTime });
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
  batchPlanTomorrow: async (data) => {
    const res = await api.post('/tasks/batch-plan-tomorrow', data);
    return res.data;
  }
};
