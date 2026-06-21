import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { School } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data || 'خطأ في اسم المستخدم أو كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Card sx={{ maxWidth: 420, width: '90%', p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <School sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>سنتر النجاح التعليمي</Typography>
            <Typography variant="body2" color="text.secondary">تسجيل الدخول إلى النظام</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="اسم المستخدم" value={username}
              onChange={(e) => setUsername(e.target.value)} required
              sx={{ mb: 2 }} dir="rtl"
            />
            <TextField
              fullWidth label="كلمة المرور" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              sx={{ mb: 3 }} dir="rtl"
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'دخول'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
