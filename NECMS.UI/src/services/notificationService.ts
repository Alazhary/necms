import api from './api';

export const notificationService = {
  async getByStudent(studentId: number): Promise<any[]> {
    const res = await api.get(`/notifications/student/${studentId}`);
    return res.data;
  },

  async create(dto: any): Promise<void> {
    await api.post('/notifications', dto);
  },
};
