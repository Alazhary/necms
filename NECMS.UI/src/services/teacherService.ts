import { supabase } from '../supabase';

export const teacherService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('teachers').select('*').order('id');
    return (data || []).map(t => ({
      id: t.id,
      fullName: t.full_name,
      phone: t.phone,
      specialization: t.specialization,
    }));
  },

  async getById(id: number): Promise<any> {
    const { data } = await supabase.from('teachers').select('*').eq('id', id).single();
    if (!data) throw new Error('المدرس غير موجود');
    return {
      id: data.id,
      fullName: data.full_name,
      phone: data.phone,
      specialization: data.specialization,
    };
  },

  async create(dto: any): Promise<any> {
    const { data } = await supabase.from('teachers').insert({
      full_name: dto.fullName,
      phone: dto.phone,
      specialization: dto.specialization,
    }).select().single();
    return data;
  },

  async update(id: number, dto: any): Promise<void> {
    await supabase.from('teachers').update({
      full_name: dto.fullName,
      phone: dto.phone,
      specialization: dto.specialization,
    }).eq('id', id);
  },

  async delete(id: number): Promise<void> {
    await supabase.from('teachers').delete().eq('id', id);
  },
};
