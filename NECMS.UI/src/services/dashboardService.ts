import api from './api';

export const dashboardService = {
  async getSummary(): Promise<any> {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  async getOwnerSummary(): Promise<any> {
    const res = await api.get('/dashboard/owner-summary');
    return res.data;
  },
};
