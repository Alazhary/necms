import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import { attendanceService } from '../services/attendanceService';
import { studentService, type StudentDto } from '../services/studentService';
import { gradeService } from '../services/gradeService';

export default function AttendancePage() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrades();
    loadStudents();
  }, []);

  const loadGrades = async () => {
    const res = await gradeService.getAll();
    setGrades(res);
    setLoading(false);
  };

  const loadStudents = async () => {
    const res = await studentService.getAll();
    setStudents(res.filter(s => s.status === 'Active'));
  };

  const loadAttendance = async () => {
    if (!selectedGrade) return;
    try {
      const res = await attendanceService.getByGrade(selectedGrade as number, date);
      const map: Record<number, string> = {};
      res.forEach((a: any) => { map[a.studentId] = a.status; });
      setAttendance(map);
    } catch { }
  };

  const filteredStudents = selectedGrade
    ? students.filter(s => s.gradeId === selectedGrade)
    : students;

  const handleSave = async () => {
    const attendances = filteredStudents
      .filter(s => attendance[s.id])
      .map(s => ({ studentId: s.id, status: attendance[s.id] || 'Present', notes: '' }));
    if (attendances.length === 0) return;
    await attendanceService.createBulk({ date: new Date(date), attendances });
    alert('تم حفظ الحضور بنجاح');
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>الحضور والغياب</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>الصف الدراسي</InputLabel>
          <Select value={selectedGrade} label="الصف الدراسي" onChange={(e) => setSelectedGrade(e.target.value as number)}>
            <MenuItem value=""><em>الكل</em></MenuItem>
            {grades.map((g) => <MenuItem key={g.id} value={g.id}>{g.gradeName}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="التاريخ" type="date" value={date}
          onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <Button variant="contained" onClick={loadAttendance}>تحميل البيانات</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>حفظ الحضور</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>الاسم</TableCell>
              <TableCell>الكود</TableCell>
              <TableCell>الحالة</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.studentCode}</TableCell>
                <TableCell>
                  <Select
                    size="small" value={attendance[s.id] || ''}
                    onChange={(e) => setAttendance({ ...attendance, [s.id]: e.target.value })}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="Present">حاضر</MenuItem>
                    <MenuItem value="Absent">غائب</MenuItem>
                    <MenuItem value="Excused">معذور</MenuItem>
                    <MenuItem value="Late">متأخر</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا يوجد طلاب</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
