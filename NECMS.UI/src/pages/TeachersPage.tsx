import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '../icons';
import { teacherService } from '../services/teacherService';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<any>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setTeachers(await teacherService.getAll()); }
    catch (err) { console.error(err); }
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
              <TableCell>التخصص</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>{t.fullName}</TableCell>
                <TableCell>{t.phone}</TableCell>
                <TableCell>{t.specialization || '---'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditItem(t); setIsEditing(true); setOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(t.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center' }}>لا يوجد مدرسين</TableCell></TableRow>
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
            <TextField label="التخصص" value={editItem.specialization || ''}
              onChange={(e) => setEditItem({ ...editItem, specialization: e.target.value })} dir="rtl" />
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
