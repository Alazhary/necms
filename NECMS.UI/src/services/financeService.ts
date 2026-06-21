import api from './api';

export const financeService = {
  async getRevenues(): Promise<any[]> {
    const res = await api.get('/finance/revenues');
    return res.data;
  },

  async createRevenue(dto: any): Promise<any> {
    const res = await api.post('/finance/revenues', dto);
    return res.data;
  },

  async getExpenses(): Promise<any[]> {
    const res = await api.get('/finance/expenses');
    return res.data;
  },

  async createExpense(dto: any): Promise<any> {
    const res = await api.post('/finance/expenses', dto);
    return res.data;
  },

  async getReport(from?: string, to?: string): Promise<any> {
    const params = new URLSearchParams();
    if (from) params.append('dateFrom', from);
    if (to) params.append('dateTo', to);
    const res = await api.get(`/finance/report?${params}`);
    return res.data;
  },

  async createTeacherPayroll(dto: any): Promise<void> {
    await api.post('/finance/payroll/teacher', dto);
  },

  async getTeacherPayrolls(): Promise<any[]> {
    const res = await api.get('/finance/payroll/teacher');
    return res.data;
  },

  async getStudentAccount(studentId: number): Promise<any[]> {
    const res = await api.get(`/finance/student-account/${studentId}`);
    return res.data;
  },
};
