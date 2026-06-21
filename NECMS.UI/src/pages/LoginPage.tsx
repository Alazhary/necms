import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { School } from '../icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('فشل تسجيل الدخول. تأكد من اسم المستخدم وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>سنتر النجاح التعليمي</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>تسجيل الدخول</Typography>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="اسم المستخدم" value={username}
              onChange={(e) => setUsername(e.target.value)} required dir="rtl" />
            <TextField fullWidth label="كلمة المرور" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required dir="rtl" />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'دخول'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
