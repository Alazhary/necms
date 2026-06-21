import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { Add } from '../icons';
import { followUpService } from '../services/followUpService';
import { studentService, type StudentDto } from '../services/studentService';

export default function FollowUpsPage() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [editItem, setEditItem] = useState<any>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setStudents(await studentService.getAll()); }
    catch {}
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (followUpType === 'daily') await followUpService.createDaily(editItem);
      else if (followUpType === 'weekly') await followUpService.createWeekly(editItem);
      else await followUpService.createMonthly(editItem);
      setOpen(false);
      setEditItem({});
    } catch (err) { console.error(err); }
  };

  const openDialog = (type: 'daily' | 'weekly' | 'monthly') => {
    setFollowUpType(type);
    setEditItem({ followUpDate: new Date().toISOString().split('T')[0] });
    setOpen(true);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>المتابعة</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => openDialog('daily')}>متابعة يومية</Button>
        <Button variant="contained" startIcon={<Add />} onClick={() => openDialog('weekly')}>متابعة أسبوعية</Button>
        <Button variant="contained" startIcon={<Add />} onClick={() => openDialog('monthly')}>متابعة شهرية</Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {followUpType === 'daily' ? 'إضافة متابعة يومية' : followUpType === 'weekly' ? 'إضافة متابعة أسبوعية' : 'إضافة متابعة شهرية'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>الطالب</InputLabel>
              <Select value={editItem.studentId || ''} label="الطالب"
                onChange={(e) => setEditItem({ ...editItem, studentId: e.target.value })}>
                {students.map((s) => <MenuItem key={s.id} value={s.id}>{s.fullName} - {s.studentCode}</MenuItem>)}
              </Select>
            </FormControl>

            {followUpType === 'daily' && (
              <>
                <TextField label="التاريخ" type="date" value={editItem.followUpDate?.split('T')[0] || ''}
                  onChange={(e) => setEditItem({ ...editItem, followUpDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="الواجب" value={editItem.homework || ''}
                  onChange={(e) => setEditItem({ ...editItem, homework: e.target.value })} dir="rtl" multiline />
                <TextField label="المشاركة" value={editItem.participation || ''}
                  onChange={(e) => setEditItem({ ...editItem, participation: e.target.value })} dir="rtl" multiline />
                <TextField label="السلوك" value={editItem.behavior || ''}
                  onChange={(e) => setEditItem({ ...editItem, behavior: e.target.value })} dir="rtl" multiline />
              </>
            )}

            {followUpType === 'weekly' && (
              <>
                <TextField label="رقم الأسبوع" type="number" value={editItem.weekNumber || ''}
                  onChange={(e) => setEditItem({ ...editItem, weekNumber: parseInt(e.target.value) })} />
                <TextField label="المستوى الأكاديمي" value={editItem.academicLevel || ''}
                  onChange={(e) => setEditItem({ ...editItem, academicLevel: e.target.value })} dir="rtl" multiline />
                <TextField label="المستوى السلوكي" value={editItem.behaviorLevel || ''}
                  onChange={(e) => setEditItem({ ...editItem, behaviorLevel: e.target.value })} dir="rtl" multiline />
              </>
            )}

            {followUpType === 'monthly' && (
              <>
                <TextField label="الشهر" value={editItem.month || ''}
                  onChange={(e) => setEditItem({ ...editItem, month: e.target.value })} dir="rtl" placeholder="مثال: 2026-06" />
                <TextField label="التقييم الأكاديمي" value={editItem.academicEvaluation || ''}
                  onChange={(e) => setEditItem({ ...editItem, academicEvaluation: e.target.value })} dir="rtl" multiline />
                <TextField label="التقييم الأخلاقي" value={editItem.ethicalEvaluation || ''}
                  onChange={(e) => setEditItem({ ...editItem, ethicalEvaluation: e.target.value })} dir="rtl" multiline />
                <TextField label="التقييم الاجتماعي" value={editItem.socialEvaluation || ''}
                  onChange={(e) => setEditItem({ ...editItem, socialEvaluation: e.target.value })} dir="rtl" multiline />
              </>
            )}

            <TextField label="ملاحظات" value={editItem.notes || ''}
              onChange={(e) => setEditItem({ ...editItem, notes: e.target.value })} dir="rtl" multiline />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
