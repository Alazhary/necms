import { supabase } from '../supabase';

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
    const { data } = await supabase.from('students').select('*, grades(name)').order('id');
    return (data || []).map(s => ({
      id: s.id,
      studentCode: s.student_code,
      fullName: s.full_name,
      birthDate: s.date_of_birth,
      gender: s.gender,
      address: s.address,
      gradeId: s.grade_id,
      gradeName: s.grades?.name,
      parentName: s.parent_name,
      phone: s.parent_phone,
      registrationDate: s.created_date,
      status: s.is_active ? 'نشط' : 'غير نشط',
    }));
  },

  async getById(id: number): Promise<StudentDto> {
    const { data } = await supabase.from('students').select('*, grades(name)').eq('id', id).single();
    if (!data) throw new Error('الطالب غير موجود');
    return {
      id: data.id,
      studentCode: data.student_code,
      fullName: data.full_name,
      birthDate: data.date_of_birth,
      gender: data.gender,
      address: data.address,
      gradeId: data.grade_id,
      gradeName: data.grades?.name,
      parentName: data.parent_name,
      phone: data.parent_phone,
      registrationDate: data.created_date,
      status: data.is_active ? 'نشط' : 'غير نشط',
    };
  },

  async create(dto: CreateStudentDto): Promise<StudentDto> {
    const year = new Date().getFullYear().toString().slice(-2);
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const code = `ST${year}${String(dto.gradeId || 0).padStart(2, '0')}${String((count || 0) + 1).padStart(3, '0')}`;
    const { data } = await supabase.from('students').insert({
      student_code: code,
      full_name: dto.fullName,
      date_of_birth: dto.birthDate,
      gender: dto.gender,
      address: dto.address,
      grade_id: dto.gradeId,
      parent_name: dto.parentFullName,
      parent_phone: dto.parentMobile,
      school_name: dto.schoolName,
    }).select('*, grades(name)').single();
    if (!data) throw new Error('فشل إنشاء الطالب');
    return {
      id: data.id,
      studentCode: data.student_code,
      fullName: data.full_name,
      birthDate: data.date_of_birth,
      gender: data.gender,
      address: data.address,
      gradeId: data.grade_id,
      gradeName: data.grades?.name,
      parentName: data.parent_name,
      phone: data.parent_phone,
      registrationDate: data.created_date,
      status: 'نشط',
    };
  },

  async update(id: number, dto: any): Promise<void> {
    await supabase.from('students').update({
      full_name: dto.fullName,
      date_of_birth: dto.birthDate,
      gender: dto.gender,
      address: dto.address,
      grade_id: dto.gradeId,
      parent_name: dto.parentFullName,
      parent_phone: dto.parentMobile,
    }).eq('id', id);
  },

  async promote(id: number, newGradeId: number): Promise<void> {
    await supabase.from('students').update({ grade_id: newGradeId }).eq('id', id);
  },

  async getByGrade(gradeId: number): Promise<StudentDto[]> {
    const { data } = await supabase.from('students').select('*, grades(name)').eq('grade_id', gradeId);
    return (data || []).map(s => ({
      id: s.id,
      studentCode: s.student_code,
      fullName: s.full_name,
      birthDate: s.date_of_birth,
      gender: s.gender,
      address: s.address,
      gradeId: s.grade_id,
      gradeName: s.grades?.name,
      parentName: s.parent_name,
      phone: s.parent_phone,
      registrationDate: s.created_date,
      status: s.is_active ? 'نشط' : 'غير نشط',
    }));
  },

  async getByCode(code: string): Promise<StudentDto> {
    const { data } = await supabase.from('students').select('*, grades(name)').eq('student_code', code).single();
    if (!data) throw new Error('الطالب غير موجود');
    return {
      id: data.id,
      studentCode: data.student_code,
      fullName: data.full_name,
      birthDate: data.date_of_birth,
      gender: data.gender,
      address: data.address,
      gradeId: data.grade_id,
      gradeName: data.grades?.name,
      parentName: data.parent_name,
      phone: data.parent_phone,
      registrationDate: data.created_date,
      status: data.is_active ? 'نشط' : 'غير نشط',
    };
  },
};
