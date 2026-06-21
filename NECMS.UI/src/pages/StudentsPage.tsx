import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, Chip, CircularProgress
} from '@mui/material';
import { Add, Edit, Visibility } from '../icons';
import { studentService, type StudentDto } from '../services/studentService';
import { gradeService } from '../services/gradeService';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Partial<any>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stu, grd] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll(),
      ]);
      setStudents(stu);
      setGrades(grd);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && editStudent.id) {
        await studentService.update(editStudent.id, editStudent);
      } else {
        await studentService.create(editStudent as any);
      }
      setOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async (id: number) => {
    const student = students.find(s => s.id === id);
    if (!student || !student.gradeId) return;
    const newGradeId = student.gradeId + 1;
    if (newGradeId > 10) return;
    try {
      await studentService.promote(id, newGradeId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter(s =>
    s.fullName.includes(search) || s.studentCode.includes(search)
  );

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>الطلاب</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => {
          setEditStudent({});
          setIsEditing(false);
          setOpen(true);
        }}>
          إضافة طالب
        </Button>
      </Box>

      <TextField
        fullWidth label="بحث بالاسم أو الكود" value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }} dir="rtl"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الكود</TableCell>
              <TableCell>الاسم</TableCell>
              <TableCell>الصف</TableCell>
              <TableCell>ولي الأمر</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.studentCode}</TableCell>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.gradeName}</TableCell>
                <TableCell>{s.parentName}</TableCell>
                <TableCell>
                  <Chip label={s.status} color={s.status === 'Active' ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/students/${s.id}`)}><Visibility /></IconButton>
                  <IconButton onClick={() => {
                    setEditStudent(s);
                    setIsEditing(true);
                    setOpen(true);
                  }}><Edit /></IconButton>
                  {s.gradeId && s.gradeId < 10 && (
                    <Button size="small" onClick={() => handlePromote(s.id)}>ترقية</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'تعديل طالب' : 'إضافة طالب جديد'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="الاسم الكامل" value={editStudent.fullName || ''}
              onChange={(e) => setEditStudent({ ...editStudent, fullName: e.target.value })} dir="rtl" />
            <FormControl fullWidth>
              <InputLabel>الصف الدراسي</InputLabel>
              <Select value={editStudent.gradeId || ''} label="الصف الدراسي"
                onChange={(e) => setEditStudent({ ...editStudent, gradeId: e.target.value })}>
                {grades.map((g) => <MenuItem key={g.id} value={g.id}>{g.gradeName}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="رقم التليفون" value={editStudent.phone || ''}
              onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })} dir="rtl" />
            <TextField label="تاريخ الميلاد" type="date" value={editStudent.birthDate?.split('T')[0] || ''}
              onChange={(e) => setEditStudent({ ...editStudent, birthDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="العنوان" value={editStudent.address || ''}
              onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })} dir="rtl" multiline />
            <TextField label="اسم المدرسة" value={editStudent.schoolName || ''}
              onChange={(e) => setEditStudent({ ...editStudent, schoolName: e.target.value })} dir="rtl" />
            {!isEditing && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>بيانات ولي الأمر</Typography>
                <TextField label="اسم ولي الأمر" value={editStudent.parentFullName || ''}
                  onChange={(e) => setEditStudent({ ...editStudent, parentFullName: e.target.value })} dir="rtl" />
                <TextField label="رقم موبايل ولي الأمر" value={editStudent.parentMobile || ''}
                  onChange={(e) => setEditStudent({ ...editStudent, parentMobile: e.target.value })} dir="rtl" />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? 'حفظ' : 'إضافة'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
