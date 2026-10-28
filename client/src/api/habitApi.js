import api from './client';

export const habitApi = {
  getHabits: async (date) => {
    const res = await api.get('/habits', { params: { date } });
    return res.data;
  },
  createHabit: async (data) => {
    const res = await api.post('/habits', data);
    return res.data;
  },
  toggleHabitDate: async (id, date) => {
    const res = await api.patch(`/habits/${id}/toggle-date`, { date });
    return res.data;
  },
  getHeatmap: async (days = 60) => {
    const res = await api.get('/habits/heatmap', { params: { days } });
    return res.data;
  },
  deleteHabit: async (id) => {
    const res = await api.delete(`/habits/${id}`);
    return res.data;
  }
};
