import api from './api';

export const examService = {
  async getAll(): Promise<any[]> {
    const res = await api.get('/exams');
    return res.data;
  },

  async getById(id: number): Promise<any> {
    const res = await api.get(`/exams/${id}`);
    return res.data;
  },

  async create(dto: any): Promise<any> {
    const res = await api.post('/exams', dto);
    return res.data;
  },

  async update(id: number, dto: any): Promise<void> {
    await api.put(`/exams/${id}`, dto);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/exams/${id}`);
  },

  async enterGrades(data: any): Promise<void> {
    await api.post('/exams/enter-grades', data);
  },

  async getResults(examId: number): Promise<any[]> {
    const res = await api.get(`/exams/${examId}/results`);
    return res.data;
  },

  async getByStudent(studentId: number): Promise<any[]> {
    const res = await api.get(`/exams/student/${studentId}`);
    return res.data;
  },
};
