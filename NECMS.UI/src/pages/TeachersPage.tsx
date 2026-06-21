import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '../icons';
import { teacherService, type TeacherDto } from '../services/teacherService';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<any>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await teacherService.getAll();
      setTeachers(res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (isEditing && editItem.id) {
        await teacherService.update(editItem.id, editItem);
      } else {
        await teacherService.create(editItem);
      }
      setOpen(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المدرس؟')) {
      await teacherService.delete(id);
      loadData();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>المدرسين</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditItem({}); setIsEditing(false); setOpen(true); }}>
          إضافة مدرس
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>رقم التليفون</TableCell>
              <TableCell>نوع الراتب</TableCell>
              <TableCell>قيمة الراتب</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.fullName}</TableCell>
                <TableCell>{t.phone}</TableCell>
                <TableCell>{t.salaryType}</TableCell>
                <TableCell>{t.salaryAmount} ج.م</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditItem(t); setIsEditing(true); setOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(t.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center' }}>لا يوجد مدرسين</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'تعديل مدرس' : 'إضافة مدرس'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="الاسم الكامل" value={editItem.fullName || ''}
              onChange={(e) => setEditItem({ ...editItem, fullName: e.target.value })} dir="rtl" />
            <TextField label="رقم التليفون" value={editItem.phone || ''}
              onChange={(e) => setEditItem({ ...editItem, phone: e.target.value })} dir="rtl" />
            <TextField label="الواتساب" value={editItem.whatsApp || ''}
              onChange={(e) => setEditItem({ ...editItem, whatsApp: e.target.value })} dir="rtl" />
            <TextField label="العنوان" value={editItem.address || ''}
              onChange={(e) => setEditItem({ ...editItem, address: e.target.value })} dir="rtl" />
            <TextField label="نوع الراتب" value={editItem.salaryType || ''}
              onChange={(e) => setEditItem({ ...editItem, salaryType: e.target.value })} dir="rtl" />
            <TextField label="قيمة الراتب" type="number" value={editItem.salaryAmount || ''}
              onChange={(e) => setEditItem({ ...editItem, salaryAmount: parseFloat(e.target.value) })} />
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
