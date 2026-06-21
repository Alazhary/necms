import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress,
  Tabs, Tab
} from '@mui/material';
import { financeService } from '../services/financeService';
import { studentService, type StudentDto } from '../services/studentService';
import { dashboardService } from '../services/dashboardService';

export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [fin, stu, sum] = await Promise.all([
        financeService.getReport(),
        studentService.getAll(),
        dashboardService.getSummary(),
      ]);
      setReport(fin);
      setStudents(stu);
      setSummary(sum);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadReport = async () => {
    const res = await financeService.getReport(from || undefined, to || undefined);
    setReport(res);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>التقارير</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="التقرير المالي" />
        <Tab label="إحصائيات عامة" />
      </Tabs>

      {tab === 0 && (
        <div>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField label="من تاريخ" type="date" value={from}
              onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="إلى تاريخ" type="date" value={to}
              onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Button variant="contained" onClick={loadReport}>عرض</Button>
          </Box>

          {report && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 4 }}>
                  <Card><CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">{report.totalRevenue} ج.م</Typography>
                    <Typography>إجمالي الإيرادات</Typography>
                  </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Card><CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="error.main">{report.totalExpenses} ج.م</Typography>
                    <Typography>إجمالي المصروفات</Typography>
                  </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Card><CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary.main">{report.netProfit} ج.م</Typography>
                    <Typography>صافي الربح</Typography>
                  </CardContent></Card>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>الإيرادات</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead><TableRow>
                    <TableCell>النوع</TableCell><TableCell>المبلغ</TableCell><TableCell>التاريخ</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {report.revenues?.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.revenueType}</TableCell>
                        <TableCell>{r.amount} ج.م</TableCell>
                        <TableCell>{r.date?.split('T')[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ mb: 2 }}>المصروفات</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead><TableRow>
                    <TableCell>النوع</TableCell><TableCell>المبلغ</TableCell><TableCell>التاريخ</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {report.expenses?.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.expenseType}</TableCell>
                        <TableCell>{e.amount} ج.م</TableCell>
                        <TableCell>{e.date?.split('T')[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </div>
      )}

      {tab === 1 && summary && (
        <div>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{summary.totalStudents}</Typography>
                <Typography color="text.secondary">إجمالي الطلاب</Typography>
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{summary.totalTeachers}</Typography>
                <Typography color="text.secondary">إجمالي المدرسين</Typography>
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{summary.totalSupervisors}</Typography>
                <Typography color="text.secondary">إجمالي المشرفات</Typography>
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{summary.attendancePercentage}%</Typography>
                <Typography color="text.secondary">نسبة الحضور</Typography>
              </CardContent></Card>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>قائمة الطلاب</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow>
                <TableCell>الكود</TableCell><TableCell>الاسم</TableCell><TableCell>الصف</TableCell><TableCell>الحالة</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.studentCode}</TableCell>
                    <TableCell>{s.fullName}</TableCell>
                    <TableCell>{s.gradeName}</TableCell>
                    <TableCell>{s.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </Box>
  );
}
