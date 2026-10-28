import api from './client';

export const studyApi = {
  logSession: async (sessionData) => {
    const res = await api.post('/study/sessions', sessionData);
    return res.data;
  },
  getSessions: async (params = {}) => {
    const res = await api.get('/study/sessions', { params });
    return res.data;
  },
  getStats: async (date) => {
    const res = await api.get('/study/stats', { params: { date } });
    return res.data;
  },
  deleteSession: async (id) => {
    const res = await api.delete(`/study/sessions/${id}`);
    return res.data;
  }
};
