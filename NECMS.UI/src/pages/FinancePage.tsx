import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Grid, Card, CardContent
} from '@mui/material';
import { Add } from '../icons';
import { financeService } from '../services/financeService';

export default function FinancePage() {
  const [tab, setTab] = useState(0);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRevenue, setOpenRevenue] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [openPayroll, setOpenPayroll] = useState(false);
  const [revItem, setRevItem] = useState<any>({});
  const [expItem, setExpItem] = useState<any>({});
  const [payItem, setPayItem] = useState<any>({});
  const [report, setReport] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [rev, exp, pay] = await Promise.all([
        financeService.getRevenues(),
        financeService.getExpenses(),
        financeService.getTeacherPayrolls(),
      ]);
      setRevenues(rev); setExpenses(exp); setPayrolls(pay);
      loadReport();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadReport = async () => {
    try {
      const res = await financeService.getReport();
      setReport(res);
    } catch {}
  };

  const handleAddRevenue = async () => {
    await financeService.createRevenue(revItem);
    setOpenRevenue(false); setRevItem({}); loadData();
  };

  const handleAddExpense = async () => {
    await financeService.createExpense(expItem);
    setOpenExpense(false); setExpItem({}); loadData();
  };

  const handleAddPayroll = async () => {
    await financeService.createTeacherPayroll(payItem);
    setOpenPayroll(false); setPayItem({}); loadData();
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>الحسابات المالية</Typography>

      {report && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 4 }}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="success.main">{report.totalRevenue} ج.م</Typography>
              <Typography variant="body2">إجمالي الإيرادات</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="error.main">{report.totalExpenses} ج.م</Typography>
              <Typography variant="body2">إجمالي المصروفات</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="primary.main">{report.netProfit} ج.م</Typography>
              <Typography variant="body2">صافي الربح</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="الإيرادات" />
        <Tab label="المصروفات" />
        <Tab label="رواتب المدرسين" />
      </Tabs>

      {tab === 0 && (
        <div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setRevItem({}); setOpenRevenue(true); }}>
              إضافة إيراد
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow>
                <TableCell>النوع</TableCell><TableCell>المبلغ</TableCell><TableCell>الطالب</TableCell><TableCell>التاريخ</TableCell><TableCell>ملاحظات</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {revenues.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.revenueType}</TableCell>
                    <TableCell>{r.amount} ج.م</TableCell>
                    <TableCell>{r.studentName || '---'}</TableCell>
                    <TableCell>{r.date?.split('T')[0]}</TableCell>
                    <TableCell>{r.notes || '---'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {tab === 1 && (
        <div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setExpItem({}); setOpenExpense(true); }}>
              إضافة مصروف
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow>
                <TableCell>النوع</TableCell><TableCell>المبلغ</TableCell><TableCell>التاريخ</TableCell><TableCell>ملاحظات</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.expenseType}</TableCell>
                    <TableCell>{e.amount} ج.م</TableCell>
                    <TableCell>{e.date?.split('T')[0]}</TableCell>
                    <TableCell>{e.notes || '---'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {tab === 2 && (
        <div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setPayItem({}); setOpenPayroll(true); }}>
              إضافة راتب
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow>
                <TableCell>الشهر</TableCell><TableCell>الراتب</TableCell><TableCell>المكافأة</TableCell><TableCell>الخصم</TableCell><TableCell>الصافي</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {payrolls.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.month}</TableCell>
                    <TableCell>{p.salary} ج.م</TableCell>
                    <TableCell>{p.bonus} ج.م</TableCell>
                    <TableCell>{p.deduction} ج.م</TableCell>
                    <TableCell>{p.netSalary} ج.م</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <Dialog open={openRevenue} onClose={() => setOpenRevenue(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة إيراد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="نوع الإيراد" value={revItem.revenueType || ''}
              onChange={(e) => setRevItem({ ...revItem, revenueType: e.target.value })} dir="rtl" />
            <TextField label="المبلغ" type="number" value={revItem.amount || ''}
              onChange={(e) => setRevItem({ ...revItem, amount: parseFloat(e.target.value) })} />
            <TextField label="تاريخ" type="date" value={revItem.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
              onChange={(e) => setRevItem({ ...revItem, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRevenue(false)}>إلغاء</Button>
          <Button onClick={handleAddRevenue} variant="contained">إضافة</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openExpense} onClose={() => setOpenExpense(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مصروف</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="نوع المصروف" value={expItem.expenseType || ''}
              onChange={(e) => setExpItem({ ...expItem, expenseType: e.target.value })} dir="rtl" />
            <TextField label="المبلغ" type="number" value={expItem.amount || ''}
              onChange={(e) => setExpItem({ ...expItem, amount: parseFloat(e.target.value) })} />
            <TextField label="تاريخ" type="date" value={expItem.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
              onChange={(e) => setExpItem({ ...expItem, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpense(false)}>إلغاء</Button>
          <Button onClick={handleAddExpense} variant="contained">إضافة</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPayroll} onClose={() => setOpenPayroll(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة راتب مدرس</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="الشهر" value={payItem.month || ''}
              onChange={(e) => setPayItem({ ...payItem, month: e.target.value })} dir="rtl" placeholder="مثال: 2026-06" />
            <TextField label="الراتب" type="number" value={payItem.salary || ''}
              onChange={(e) => setPayItem({ ...payItem, salary: parseFloat(e.target.value) })} />
            <TextField label="المكافأة" type="number" value={payItem.bonus || ''}
              onChange={(e) => setPayItem({ ...payItem, bonus: parseFloat(e.target.value) })} />
            <TextField label="الخصم" type="number" value={payItem.deduction || ''}
              onChange={(e) => setPayItem({ ...payItem, deduction: parseFloat(e.target.value) })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayroll(false)}>إلغاء</Button>
          <Button onClick={handleAddPayroll} variant="contained">إضافة</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
