import api from './api';

export const attendanceService = {
  async create(data: any): Promise<void> {
    await api.post('/attendance', data);
  },

  async createBulk(data: any): Promise<void> {
    await api.post('/attendance/bulk', data);
  },

  async getByStudent(studentId: number): Promise<any[]> {
    const res = await api.get(`/attendance/student/${studentId}`);
    return res.data;
  },

  async getByDate(date: string): Promise<any[]> {
    const res = await api.get(`/attendance/date/${date}`);
    return res.data;
  },

  async getByGrade(gradeId: number, date: string): Promise<any[]> {
    const res = await api.get(`/attendance/grade/${gradeId}/${date}`);
    return res.data;
  },
};
