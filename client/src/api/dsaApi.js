import api from './client';

export const dsaApi = {
  getQuestions: async () => {
    const res = await api.get('/dsa');
    return res.data;
  },
  toggleQuestion: async (id) => {
    const res = await api.patch(`/dsa/${id}/toggle`);
    return res.data;
  },
  addQuestion: async (data) => {
    const res = await api.post('/dsa', data);
    return res.data;
  },
  deleteQuestion: async (id) => {
    const res = await api.delete(`/dsa/${id}`);
    return res.data;
  }
};
