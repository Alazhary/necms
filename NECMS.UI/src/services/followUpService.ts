import api from './api';

export const followUpService = {
  async createDaily(dto: any): Promise<void> {
    await api.post('/followups/daily', dto);
  },

  async createWeekly(dto: any): Promise<void> {
    await api.post('/followups/weekly', dto);
  },

  async createMonthly(dto: any): Promise<void> {
    await api.post('/followups/monthly', dto);
  },

  async getDailyByStudent(studentId: number): Promise<any[]> {
    const res = await api.get(`/followups/daily/student/${studentId}`);
    return res.data;
  },

  async getWeeklyByStudent(studentId: number): Promise<any[]> {
    const res = await api.get(`/followups/weekly/student/${studentId}`);
    return res.data;
  },

  async getMonthlyByStudent(studentId: number): Promise<any[]> {
    const res = await api.get(`/followups/monthly/student/${studentId}`);
    return res.data;
  },
};
