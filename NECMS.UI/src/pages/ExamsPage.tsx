import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Tabs, Tab
} from '@mui/material';
import { Add } from '../icons';
import { examService } from '../services/examService';
import { subjectService } from '../services/subjectService';
import { gradeService } from '../services/gradeService';
import { studentService, type StudentDto } from '../services/studentService';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [gradesData, setGradesData] = useState<Record<number, string>>({});
  const [editItem, setEditItem] = useState<any>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ex, sb, gr] = await Promise.all([
        examService.getAll(), subjectService.getAll(), gradeService.getAll()
      ]);
      setExams(ex); setSubjects(sb); setGrades(gr);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadStudents = async (gradeId?: number) => {
    const all = await studentService.getAll();
    setStudents(all.filter(s => s.status === 'Active' && (!gradeId || s.gradeId === gradeId)));
  };

  const handleCreateExam = async () => {
    try {
      await examService.create(editItem);
      setOpen(false);
      setEditItem({});
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleEnterGrades = async () => {
    if (!selectedExam) return;
    const grades = Object.entries(gradesData)
      .filter(([_, m]) => m)
      .map(([studentId, marks]) => ({ exam_id: selectedExam.id, student_id: parseInt(studentId), score: parseFloat(marks) }));
    await examService.enterGrades(grades);
    alert('تم حفظ الدرجات بنجاح');
  };

  const startGrading = async (exam: any) => {
    setSelectedExam(exam);
    setGradesData({});
    await loadStudents(exam.gradeId);
    setTab(1);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>الامتحانات والدرجات</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="الامتحانات" />
        <Tab label="إدخال درجات" />
      </Tabs>

      {tab === 0 && (
        <div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditItem({}); setOpen(true); }}>
              إنشاء امتحان
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>المادة</TableCell>
                  <TableCell>الصف</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>الدرجة الكلية</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.examName}</TableCell>
                    <TableCell>{e.subjectName || e.subjectId}</TableCell>
                    <TableCell>{e.gradeName || e.gradeId}</TableCell>
                    <TableCell>{e.examType}</TableCell>
                    <TableCell>{e.totalMarks}</TableCell>
                    <TableCell>{e.examDate?.split('T')[0]}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => startGrading(e)}>
                        إدخال درجات
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {exams.length === 0 && (
                  <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center' }}>لا توجد امتحانات</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {tab === 1 && selectedExam && (
        <div>
          <Typography variant="h6" sx={{ mb: 2 }}>{selectedExam.examName} - الدرجة الكلية: {selectedExam.totalMarks}</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow><TableCell>#</TableCell><TableCell>الاسم</TableCell><TableCell>الكود</TableCell><TableCell>الدرجة</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {students.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{s.fullName}</TableCell>
                    <TableCell>{s.studentCode}</TableCell>
                    <TableCell>
                      <TextField type="number" size="small" value={gradesData[s.id] || ''}
                        onChange={(e) => setGradesData({ ...gradesData, [s.id]: e.target.value })}
                        slotProps={{ htmlInput: { max: selectedExam.totalMarks } }} sx={{ width: 100 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleEnterGrades}>حفظ الدرجات</Button>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إنشاء امتحان جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="اسم الامتحان" value={editItem.examName || ''}
              onChange={(e) => setEditItem({ ...editItem, examName: e.target.value })} dir="rtl" />
            <FormControl fullWidth>
              <InputLabel>المادة</InputLabel>
              <Select value={editItem.subjectId || ''} label="المادة"
                onChange={(e) => setEditItem({ ...editItem, subjectId: e.target.value })}>
                {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.subjectName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>الصف</InputLabel>
              <Select value={editItem.gradeId || ''} label="الصف"
                onChange={(e) => setEditItem({ ...editItem, gradeId: e.target.value })}>
                {grades.map((g) => <MenuItem key={g.id} value={g.id}>{g.gradeName}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="الدرجة الكلية" type="number" value={editItem.totalMarks || ''}
              onChange={(e) => setEditItem({ ...editItem, totalMarks: parseFloat(e.target.value) })} />
            <TextField label="التاريخ" type="date" value={editItem.examDate?.split('T')[0] || ''}
              onChange={(e) => setEditItem({ ...editItem, examDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleCreateExam} variant="contained">إنشاء</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
