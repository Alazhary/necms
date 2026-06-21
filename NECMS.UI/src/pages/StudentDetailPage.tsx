import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress
} from '@mui/material';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { examService } from '../services/examService';
import { followUpService } from '../services/followUpService';
import { financeService } from '../services/financeService';
import { notificationService } from '../services/notificationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [dailyFU, setDailyFU] = useState<any[]>([]);
  const [weeklyFU, setWeeklyFU] = useState<any[]>([]);
  const [monthlyFU, setMonthlyFU] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(parseInt(id));
  }, [id]);

  const loadData = async (studentId: number) => {
    try {
      const [stu, att, ex, dfu, wfu, mfu, notif, rev] = await Promise.all([
        studentService.getById(studentId),
        attendanceService.getByStudent(studentId),
        examService.getByStudent(studentId),
        followUpService.getDailyByStudent(studentId),
        followUpService.getWeeklyByStudent(studentId),
        followUpService.getMonthlyByStudent(studentId),
        notificationService.getByStudent(studentId),
        financeService.getStudentAccount(studentId),
      ]);
      setStudent(stu);
      setAttendance(att);
      setExams(ex);
      setDailyFU(dfu);
      setWeeklyFU(wfu);
      setMonthlyFU(mfu);
      setNotifications(notif);
      setRevenues(rev);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (!student) return <Typography>الطالب غير موجود</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>{student.fullName}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        الكود: {student.studentCode} | الصف: {student.gradeName} | الحالة: <Chip label={student.status} color={student.status === 'Active' ? 'success' : 'default'} size="small" />
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="البيانات الأساسية" />
        <Tab label="الحضور" />
        <Tab label="الامتحانات والدرجات" />
        <Tab label="المتابعة اليومية" />
        <Tab label="المتابعة الأسبوعية" />
        <Tab label="المتابعة الشهرية" />
        <Tab label="الإشعارات" />
        <Tab label="الحسابات" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Card>
          <CardContent>
            <Typography><strong>الاسم:</strong> {student.fullName}</Typography>
            <Typography><strong>الكود:</strong> {student.studentCode}</Typography>
            <Typography><strong>تاريخ الميلاد:</strong> {student.birthDate?.split('T')[0] || '---'}</Typography>
            <Typography><strong>الصف:</strong> {student.gradeName}</Typography>
            <Typography><strong>المدرسة:</strong> {student.schoolName || '---'}</Typography>
            <Typography><strong>ولي الأمر:</strong> {student.parentName || '---'}</Typography>
            <Typography><strong>رقم التليفون:</strong> {student.phone || '---'}</Typography>
            <Typography><strong>العنوان:</strong> {student.address || '---'}</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>التاريخ</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>ملاحظات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.date?.split('T')[0]}</TableCell>
                  <TableCell><Chip label={a.status} size="small" /></TableCell>
                  <TableCell>{a.notes || '---'}</TableCell>
                </TableRow>
              ))}
              {attendance.length === 0 && (
                <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الامتحان</TableCell>
                <TableCell>المادة</TableCell>
                <TableCell>الدرجة</TableCell>
                <TableCell>الدرجة الكلية</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.examName}</TableCell>
                  <TableCell>{e.subjectName}</TableCell>
                  <TableCell>{e.marks}</TableCell>
                  <TableCell>{e.totalMarks}</TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>التاريخ</TableCell>
                <TableCell>الواجب</TableCell>
                <TableCell>المشاركة</TableCell>
                <TableCell>السلوك</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyFU.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.followUpDate?.split('T')[0]}</TableCell>
                  <TableCell>{d.homework || '---'}</TableCell>
                  <TableCell>{d.participation || '---'}</TableCell>
                  <TableCell>{d.behavior || '---'}</TableCell>
                </TableRow>
              ))}
              {dailyFU.length === 0 && (
                <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الأسبوع</TableCell>
                <TableCell>المستوى الأكاديمي</TableCell>
                <TableCell>المستوى السلوكي</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeklyFU.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>الأسبوع {w.weekNumber}</TableCell>
                  <TableCell>{w.academicLevel || '---'}</TableCell>
                  <TableCell>{w.behaviorLevel || '---'}</TableCell>
                </TableRow>
              ))}
              {weeklyFU.length === 0 && (
                <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tab} index={5}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الشهر</TableCell>
                <TableCell>التقييم الأكاديمي</TableCell>
                <TableCell>التقييم الأخلاقي</TableCell>
                <TableCell>التقييم الاجتماعي</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyFU.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.month}</TableCell>
                  <TableCell>{m.academicEvaluation || '---'}</TableCell>
                  <TableCell>{m.ethicalEvaluation || '---'}</TableCell>
                  <TableCell>{m.socialEvaluation || '---'}</TableCell>
                </TableRow>
              ))}
              {monthlyFU.length === 0 && (
                <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا توجد بيانات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tab} index={6}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>النوع</TableCell>
                <TableCell>الرسالة</TableCell>
                <TableCell>التاريخ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.notificationType}</TableCell>
                  <TableCell>{n.message}</TableCell>
                  <TableCell>{n.sentDate?.split('T')[0]}</TableCell>
                </TableRow>
              ))}
              {notifications.length === 0 && (
                <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center' }}>لا توجد إشعارات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tab} index={7}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>النوع</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>ملاحظات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {revenues.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.revenueType}</TableCell>
                  <TableCell>{r.amount} ج.م</TableCell>
                  <TableCell>{r.date?.split('T')[0]}</TableCell>
                  <TableCell>{r.notes || '---'}</TableCell>
                </TableRow>
              ))}
              {revenues.length === 0 && (
                <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا توجد معاملات مالية</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
}
