import { supabase } from '../supabase';

export const attendanceService = {
  async getAll() {
    const { data } = await supabase.from('attendance').select('*, students(full_name, student_code)');
    return data || [];
  },

  async create(data: any): Promise<void> {
    await supabase.from('attendance').insert(data);
  },

  async createBulk(records: any[]): Promise<void> {
    await supabase.from('attendance').upsert(records, { onConflict: 'student_id,date' });
  },

  async getByStudent(studentId: number): Promise<any[]> {
    const { data } = await supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false });
    return data || [];
  },

  async getByDate(date: string): Promise<any[]> {
    const { data } = await supabase.from('attendance').select('*, students(full_name, student_code)').eq('date', date);
    return data || [];
  },

  async getByGrade(gradeId: number, date: string): Promise<any[]> {
    const { data: students } = await supabase.from('students').select('id').eq('grade_id', gradeId);
    const ids = students?.map(s => s.id) || [];
    if (ids.length === 0) return [];
    const { data } = await supabase.from('attendance').select('*, students(full_name, student_code)').in('student_id', ids).eq('date', date);
    return data || [];
  },
};
