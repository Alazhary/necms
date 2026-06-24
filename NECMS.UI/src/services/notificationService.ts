import { supabase } from '../supabase';

export const notificationService = {
  async getByStudent(studentId: number): Promise<any[]> {
    const { data } = await supabase.from('notifications').select('*').eq('entity', `student_${studentId}`).order('created_date', { ascending: false });
    return (data || []).map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      createdDate: n.created_date,
    }));
  },

  async create(dto: any): Promise<void> {
    await supabase.from('notifications').insert({
      title: dto.title,
      message: dto.message,
      profile_id: dto.profileId,
    });
  },
};
