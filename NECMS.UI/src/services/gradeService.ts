import { supabase } from '../supabase';

export const gradeService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('grades').select('*').order('level');
    return (data || []).map(g => ({ id: g.id, name: g.name, level: g.level }));
  },
};
