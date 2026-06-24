import { supabase } from '../supabase';

export const dashboardService = {
  async getSummary(): Promise<any> {
    const { count: studentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: teachersCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
    const { count: supervisorsCount } = await supabase.from('supervisors').select('*', { count: 'exact', head: true });
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('*', { count: 'exact' })
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('status', 'present');
    const { data: revenues } = await supabase.from('revenues').select('amount');
    const { data: expenses } = await supabase.from('expenses').select('amount');
    const totalRevenue = revenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    return {
      studentsCount: studentsCount || 0,
      teachersCount: teachersCount || 0,
      supervisorsCount: supervisorsCount || 0,
      todayAttendance: todayAttendance?.length || 0,
      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses,
    };
  },

  async getOwnerSummary(): Promise<any> {
    return this.getSummary();
  },
};
