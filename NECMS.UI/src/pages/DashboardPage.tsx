import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { People, School, SupervisorAccount, AttachMoney, TrendingDown, TrendingUp, FactCheck } from '../icons';
import { dashboardService } from '../services/dashboardService';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await dashboardService.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  const cards = [
    { title: 'الطلاب', value: data?.totalStudents || 0, icon: <People />, color: '#1976d2' },
    { title: 'المدرسين', value: data?.totalTeachers || 0, icon: <School />, color: '#388e3c' },
    { title: 'المشرفات', value: data?.totalSupervisors || 0, icon: <SupervisorAccount />, color: '#7b1fa2' },
    { title: 'إيرادات اليوم', value: `${data?.todayRevenue || 0} ج.م`, icon: <TrendingUp />, color: '#2e7d32' },
    { title: 'مصروفات اليوم', value: `${data?.todayExpenses || 0} ج.م`, icon: <TrendingDown />, color: '#c62828' },
    { title: 'صافي الربح', value: `${data?.netProfit || 0} ج.م`, icon: <AttachMoney />, color: '#f57c00' },
    { title: 'نسبة الحضور', value: `${data?.attendancePercentage || 0}%`, icon: <FactCheck />, color: '#00695c' },
  ];

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>لوحة التحكم</Typography>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.title}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
