import api from './api';

export interface TeacherDto {
  id: number;
  fullName: string;
  phone?: string;
  whatsApp?: string;
  address?: string;
  salaryType?: string;
  salaryAmount: number;
  notes?: string;
  subjects: string[];
}

export const teacherService = {
  async getAll(): Promise<TeacherDto[]> {
    const res = await api.get('/teachers');
    return res.data;
  },

  async getById(id: number): Promise<TeacherDto> {
    const res = await api.get(`/teachers/${id}`);
    return res.data;
  },

  async create(dto: any): Promise<TeacherDto> {
    const res = await api.post('/teachers', dto);
    return res.data;
  },

  async update(id: number, dto: any): Promise<void> {
    await api.put(`/teachers/${id}`, dto);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/teachers/${id}`);
  },
};
