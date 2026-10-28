import api from './client';

export const analyticsApi = {
  getOverview: async (days = 30) => {
    const res = await api.get('/analytics/overview', { params: { days } });
    return res.data;
  }
};
