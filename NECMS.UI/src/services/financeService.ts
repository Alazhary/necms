import { supabase } from '../supabase';

export const financeService = {
  async getRevenues(): Promise<any[]> {
    const { data } = await supabase.from('revenues').select('*').order('date', { ascending: false });
    return (data || []).map(r => ({ id: r.id, amount: r.amount, source: r.source, date: r.date, notes: r.notes }));
  },

  async createRevenue(dto: any): Promise<any> {
    const { data } = await supabase.from('revenues').insert({
      amount: dto.amount,
      source: dto.source,
      date: dto.date,
      notes: dto.notes,
    }).select().single();
    return data;
  },

  async getExpenses(): Promise<any[]> {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    return (data || []).map(e => ({ id: e.id, amount: e.amount, description: e.description, category: e.category, date: e.date, notes: e.notes }));
  },

  async createExpense(dto: any): Promise<any> {
    const { data } = await supabase.from('expenses').insert({
      amount: dto.amount,
      description: dto.description,
      category: dto.category,
      date: dto.date,
      notes: dto.notes,
    }).select().single();
    return data;
  },

  async getReport(from?: string, to?: string): Promise<any> {
    let query = supabase.from('revenues').select('*');
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    const { data: revenues } = await query;

    let expQuery = supabase.from('expenses').select('*');
    if (from) expQuery = expQuery.gte('date', from);
    if (to) expQuery = expQuery.lte('date', to);
    const { data: expenses } = await expQuery;

    const totalRevenue = revenues?.reduce((s, r) => s + Number(r.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;

    return { revenues, expenses, totalRevenue, totalExpenses, totalProfit: totalRevenue - totalExpenses };
  },

  async createTeacherPayroll(dto: any): Promise<void> {
    await supabase.from('teacher_payroll').insert({
      teacher_id: dto.teacherId,
      month: dto.month,
      amount: dto.amount,
      is_paid: dto.isPaid || false,
      paid_date: dto.paidDate,
    });
  },

  async getTeacherPayrolls(): Promise<any[]> {
    const { data } = await supabase.from('teacher_payroll').select('*, teachers(full_name)').order('month', { ascending: false });
    return (data || []).map(p => ({
      id: p.id,
      teacherId: p.teacher_id,
      teacherName: p.teachers?.full_name,
      month: p.month,
      amount: p.amount,
      isPaid: p.is_paid,
      paidDate: p.paid_date,
    }));
  },

  async getStudentAccount(studentId: number): Promise<any[]> {
    const { data: revenues } = await supabase.from('revenues').select('*').eq('source', `student_${studentId}`);
    return revenues || [];
  },
};
