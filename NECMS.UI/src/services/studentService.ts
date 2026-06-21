import api from './api';

export interface StudentDto {
  id: number;
  studentCode: string;
  fullName: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  schoolName?: string;
  gradeId?: number;
  gradeName?: string;
  parentId?: number;
  parentName?: string;
  phone?: string;
  whatsApp?: string;
  registrationDate: string;
  status: string;
}

export interface CreateStudentDto {
  fullName: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  schoolName?: string;
  gradeId?: number;
  phone?: string;
  whatsApp?: string;
  parentFullName?: string;
  parentMobile?: string;
  parentMobile2?: string;
  parentWhatsApp?: string;
  parentAddress?: string;
}

export const studentService = {
  async getAll(): Promise<StudentDto[]> {
    const res = await api.get('/students');
    return res.data;
  },

  async getById(id: number): Promise<StudentDto> {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },

  async create(dto: CreateStudentDto): Promise<StudentDto> {
    const res = await api.post('/students', dto);
    return res.data;
  },

  async update(id: number, dto: any): Promise<void> {
    await api.put(`/students/${id}`, dto);
  },

  async promote(id: number, newGradeId: number): Promise<void> {
    await api.post(`/students/${id}/promote`, { studentId: id, newGradeId });
  },

  async getByGrade(gradeId: number): Promise<StudentDto[]> {
    const res = await api.get(`/students/grade/${gradeId}`);
    return res.data;
  },

  async getByCode(code: string): Promise<StudentDto> {
    const res = await api.get(`/students/code/${code}`);
    return res.data;
  },
};
