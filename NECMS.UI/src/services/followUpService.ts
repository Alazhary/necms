import { supabase } from '../supabase';

export const followUpService = {
  async createDaily(dto: any): Promise<void> {
    await supabase.from('daily_follow_ups').insert({
      student_id: dto.studentId,
      date: dto.date,
      status: dto.status,
      teacher_notes: dto.notes,
      teacher_id: dto.teacherId,
    });
  },

  async createWeekly(dto: any): Promise<void> {
    await supabase.from('weekly_follow_ups').insert({
      student_id: dto.studentId,
      week_start: dto.weekStart,
      status: dto.status,
      notes: dto.notes,
      teacher_id: dto.teacherId,
    });
  },

  async createMonthly(dto: any): Promise<void> {
    await supabase.from('monthly_follow_ups').insert({
      student_id: dto.studentId,
      month: dto.month,
      status: dto.status,
      notes: dto.notes,
      teacher_id: dto.teacherId,
    });
  },

  async getDailyByStudent(studentId: number): Promise<any[]> {
    const { data } = await supabase
      .from('daily_follow_ups')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    return (data || []).map(d => ({
      id: d.id,
      studentId: d.student_id,
      date: d.date,
      status: d.status,
      notes: d.teacher_notes,
    }));
  },

  async getWeeklyByStudent(studentId: number): Promise<any[]> {
    const { data } = await supabase
      .from('weekly_follow_ups')
      .select('*')
      .eq('student_id', studentId)
      .order('week_start', { ascending: false });
    return (data || []).map(w => ({
      id: w.id,
      studentId: w.student_id,
      weekStart: w.week_start,
      status: w.status,
      notes: w.notes,
    }));
  },

  async getMonthlyByStudent(studentId: number): Promise<any[]> {
    const { data } = await supabase
      .from('monthly_follow_ups')
      .select('*')
      .eq('student_id', studentId)
      .order('month', { ascending: false });
    return (data || []).map(m => ({
      id: m.id,
      studentId: m.student_id,
      month: m.month,
      status: m.status,
      notes: m.notes,
    }));
  },
};
