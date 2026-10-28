import api from './client';

export const reviewApi = {
  getTodaySummary: async (date) => {
    const res = await api.get('/reviews/today-summary', { params: { date } });
    return res.data;
  },
  submitReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },
  getHistory: async (limit = 30) => {
    const res = await api.get('/reviews/history', { params: { limit } });
    return res.data;
  }
};
