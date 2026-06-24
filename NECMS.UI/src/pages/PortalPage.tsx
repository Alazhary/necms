import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab, CircularProgress
} from '@mui/material';
import { School, Search } from '../icons';
import { supabase } from '../supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function PortalPage() {
  const { code } = useParams<{ code: string }>();
  const [studentCode, setStudentCode] = useState(code || '');
  const [student, setStudent] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const searchStudent = async () => {
    if (!studentCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data: studentData } = await supabase
        .from('students')
        .select('*, grades(name), attendance(*), exam_results(*), daily_follow_ups(*), weekly_follow_ups(*), monthly_follow_ups(*), notifications(*)')
        .eq('student_code', studentCode)
        .single();
      if (!studentData) { throw new Error('الطالب غير موجود'); }
      setStudent({
        id: studentData.id,
        fullName: studentData.full_name,
        studentCode: studentData.student_code,
        gradeName: studentData.grades?.name,
      });
      setData({
        attendance: studentData.attendance,
        exams: studentData.exam_results,
        weeklyFollowUps: studentData.weekly_follow_ups,
        monthlyFollowUps: studentData.monthly_follow_ups,
        notifications: studentData.notifications,
      });
    } catch {
      setError('الطالب غير موجود. تأكد من الكود المدخل.');
      setStudent(null);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <School sx={{ fontSize: 50, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>بوابة أولياء الأمور</Typography>
        <Typography variant="body1" color="text.secondary">سنتر النجاح التعليمي</Typography>
      </Box>

      <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
        <CardContent sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth label="الكود الفريد للطالب" value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)} dir="rtl"
            onKeyDown={(e) => e.key === 'Enter' && searchStudent()} />
          <Button variant="contained" onClick={searchStudent} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <Search />}
          </Button>
        </CardContent>
        {error && <CardContent><Typography color="error">{error}</Typography></CardContent>}
      </Card>

      {student && data && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{student.fullName}</Typography>
              <Typography>الكود: {student.studentCode}</Typography>
              {student.gradeName && <Typography>الصف: {student.gradeName}</Typography>}
              {student.schoolName && <Typography>المدرسة: {student.schoolName}</Typography>}
            </CardContent>
          </Card>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="الحضور" />
            <Tab label="الدرجات" />
            <Tab label="التقييمات" />
            <Tab label="الإشعارات" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow>
                  <TableCell>التاريخ</TableCell><TableCell>الحالة</TableCell><TableCell>ملاحظات</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {data.attendance?.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.date?.split('T')[0]}</TableCell>
                      <TableCell><Chip label={a.status} size="small" /></TableCell>
                      <TableCell>{a.notes || '---'}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow>
                  <TableCell>الامتحان</TableCell><TableCell>المادة</TableCell><TableCell>الدرجة</TableCell><TableCell>الكلية</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {data.exams?.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.examName}</TableCell>
                      <TableCell>{e.subjectName}</TableCell>
                      <TableCell>{e.marks}</TableCell>
                      <TableCell>{e.totalMarks}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow>
                  <TableCell>النوع</TableCell><TableCell>التقييم</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {data.weeklyFollowUps?.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell>أسبوعي - الأسبوع {w.weekNumber}</TableCell>
                      <TableCell>{w.academicLevel} / {w.behaviorLevel}</TableCell>
                    </TableRow>
                  ))}
                  {data.monthlyFollowUps?.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell>شهري - {m.month}</TableCell>
                      <TableCell>{m.academicEvaluation} / {m.ethicalEvaluation} / {m.socialEvaluation}</TableCell>
                    </TableRow>
                  ))}
                  {(!data.weeklyFollowUps?.length && !data.monthlyFollowUps?.length) && (
                    <TableRow><TableCell colSpan={2} sx={{ textAlign: 'center' }}>لا توجد تقييمات</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow>
                  <TableCell>النوع</TableCell><TableCell>الرسالة</TableCell><TableCell>التاريخ</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {data.notifications?.map((n: any) => (
                    <TableRow key={n.id}>
                      <TableCell>{n.notificationType}</TableCell>
                      <TableCell>{n.message}</TableCell>
                      <TableCell>{n.sentDate?.split('T')[0]}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center' }}>لا توجد إشعارات</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      )}
    </Box>
  );
}
