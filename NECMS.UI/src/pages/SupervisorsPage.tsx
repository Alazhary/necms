import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '../icons';
import { supervisorService } from '../services/supervisorService';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<any>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setSupervisors(await supervisorService.getAll()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (isEditing && editItem.id) {
        await supervisorService.update(editItem.id, editItem);
      } else {
        await supervisorService.create(editItem);
      }
      setOpen(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) {
      await supervisorService.delete(id);
      loadData();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>المشرفات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditItem({}); setIsEditing(false); setOpen(true); }}>
          إضافة مشرفة
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>رقم التليفون</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supervisors.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.fullName}</TableCell>
                <TableCell>{s.phone || '---'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditItem(s); setIsEditing(true); setOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(s.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {supervisors.length === 0 && (
              <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center' }}>لا يوجد مشرفات</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'تعديل مشرفة' : 'إضافة مشرفة'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="الاسم الكامل" value={editItem.fullName || ''}
              onChange={(e) => setEditItem({ ...editItem, fullName: e.target.value })} dir="rtl" />
            <TextField label="رقم التليفون" value={editItem.phone || ''}
              onChange={(e) => setEditItem({ ...editItem, phone: e.target.value })} dir="rtl" />
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
