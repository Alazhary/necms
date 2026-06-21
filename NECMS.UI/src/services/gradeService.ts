import api from './api';

export const gradeService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/grades');
    return res.data;
  },
};
