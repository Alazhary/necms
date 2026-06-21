import api from './api';

export const subjectService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/subjects');
    return res.data;
  },

  async getByGrade(gradeId: number): Promise<any[]> {
    const res = await api.get(`/subjects/grade/${gradeId}`);
    return res.data;
  },
};
