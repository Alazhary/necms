import { supabase } from '../supabase';

export const supervisorService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('supervisors').select('*').order('id');
    return (data || []).map(s => ({
      id: s.id,
      fullName: s.full_name,
      phone: s.phone,
    }));
  },

  async getById(id: number): Promise<any> {
    const { data } = await supabase.from('supervisors').select('*').eq('id', id).single();
    if (!data) throw new Error('المشرف غير موجود');
    return {
      id: data.id,
      fullName: data.full_name,
      phone: data.phone,
    };
  },

  async create(dto: any): Promise<any> {
    const { data } = await supabase.from('supervisors').insert({
      full_name: dto.fullName,
      phone: dto.phone,
    }).select().single();
    return data;
  },

  async update(id: number, dto: any): Promise<void> {
    await supabase.from('supervisors').update({
      full_name: dto.fullName,
      phone: dto.phone,
    }).eq('id', id);
  },

  async delete(id: number): Promise<void> {
    await supabase.from('supervisors').delete().eq('id', id);
  },
};
