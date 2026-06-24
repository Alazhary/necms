import { supabase } from '../supabase';

export const examService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name), grades(name)')
      .order('exam_date', { ascending: false });
    return (data || []).map(e => ({
      id: e.id,
      title: e.title,
      subjectId: e.subject_id,
      subjectName: e.subjects?.name,
      gradeId: e.grade_id,
      gradeName: e.grades?.name,
      examDate: e.exam_date,
      maxScore: e.max_score,
      notes: e.notes,
    }));
  },

  async getById(id: number): Promise<any> {
    const { data } = await supabase
      .from('exams')
      .select('*, subjects(name), grades(name)')
      .eq('id', id)
      .single();
    if (!data) throw new Error('الاختبار غير موجود');
    return {
      id: data.id,
      title: data.title,
      subjectId: data.subject_id,
      subjectName: data.subjects?.name,
      gradeId: data.grade_id,
      gradeName: data.grades?.name,
      examDate: data.exam_date,
      maxScore: data.max_score,
    };
  },

  async create(dto: any): Promise<any> {
    const { data } = await supabase.from('exams').insert({
      title: dto.title,
      subject_id: dto.subjectId,
      grade_id: dto.gradeId,
      exam_date: dto.examDate,
      max_score: dto.maxScore,
    }).select().single();
    return data;
  },

  async update(id: number, dto: any): Promise<void> {
    await supabase.from('exams').update({
      title: dto.title,
      subject_id: dto.subjectId,
      grade_id: dto.gradeId,
      exam_date: dto.examDate,
      max_score: dto.maxScore,
    }).eq('id', id);
  },

  async delete(id: number): Promise<void> {
    await supabase.from('exams').delete().eq('id', id);
  },

  async enterGrades(results: any[]): Promise<void> {
    await supabase.from('exam_results').upsert(results, { onConflict: 'exam_id,student_id' });
  },

  async getResults(examId: number): Promise<any[]> {
    const { data } = await supabase
      .from('exam_results')
      .select('*, students(full_name, student_code)')
      .eq('exam_id', examId);
    return (data || []).map(r => ({
      id: r.id,
      examId: r.exam_id,
      studentId: r.student_id,
      studentName: r.students?.full_name,
      studentCode: r.students?.student_code,
      score: r.score,
    }));
  },

  async getByStudent(studentId: number): Promise<any[]> {
    const { data } = await supabase
      .from('exam_results')
      .select('*, exams(title, exam_date, max_score, subjects(name))')
      .eq('student_id', studentId);
    return (data || []).map(r => ({
      id: r.id,
      examId: r.exam_id,
      examTitle: r.exams?.title,
      examDate: r.exams?.exam_date,
      subjectName: r.exams?.subjects?.name,
      score: r.score,
      maxScore: r.exams?.max_score,
    }));
  },
};
