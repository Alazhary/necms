import api from './api';

export interface SupervisorDto {
  id: number;
  fullName: string;
  phone?: string;
  address?: string;
  salary: number;
  notes?: string;
}

export const supervisorService = {
  async getAll(): Promise<SupervisorDto[]> {
    const res = await api.get('/supervisors');
    return res.data;
  },

  async getById(id: number): Promise<SupervisorDto> {
    const res = await api.get(`/supervisors/${id}`);
    return res.data;
  },

  async create(dto: any): Promise<SupervisorDto> {
    const res = await api.post('/supervisors', dto);
    return res.data;
  },

  async update(id: number, dto: any): Promise<void> {
    await api.put(`/supervisors/${id}`, dto);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/supervisors/${id}`);
  },
};
