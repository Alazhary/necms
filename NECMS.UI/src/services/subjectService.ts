import { supabase } from '../supabase';

export const subjectService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('subjects').select('*, grades(name)').order('id');
    return (data || []).map(s => ({ id: s.id, name: s.name, gradeId: s.grade_id, gradeName: s.grades?.name }));
  },

  async getByGrade(gradeId: number): Promise<any[]> {
    const { data } = await supabase.from('subjects').select('*').eq('grade_id', gradeId);
    return (data || []).map(s => ({ id: s.id, name: s.name, gradeId: s.grade_id }));
  },
};
