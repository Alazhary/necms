import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem
} from '@mui/material';
import {
  Dashboard, People, School, SupervisorAccount, FactCheck,
  Assignment, AttachMoney, TrendingUp, Logout, Menu as MenuIcon
} from '../icons';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'لوحة التحكم', path: '/dashboard', icon: <Dashboard />, roles: ['Owner', 'Supervisor', 'Teacher'] },
  { text: 'الطلاب', path: '/students', icon: <People />, roles: ['Owner', 'Supervisor'] },
  { text: 'المدرسين', path: '/teachers', icon: <School />, roles: ['Owner'] },
  { text: 'المشرفات', path: '/supervisors', icon: <SupervisorAccount />, roles: ['Owner'] },
  { text: 'الحضور', path: '/attendance', icon: <FactCheck />, roles: ['Owner', 'Supervisor'] },
  { text: 'الامتحانات', path: '/exams', icon: <Assignment />, roles: ['Owner', 'Supervisor', 'Teacher'] },
  { text: 'المالية', path: '/finance', icon: <AttachMoney />, roles: ['Owner'] },
  { text: 'المتابعة', path: '/followups', icon: <TrendingUp />, roles: ['Owner', 'Supervisor'] },
  { text: 'التقارير', path: '/reports', icon: <TrendingUp />, roles: ['Owner'] },
];

export default function MainLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenu = menuItems.filter(item => hasRole(...item.roles));

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>سنتر النجاح</Typography>
      </Box>
      <List>
        {filteredMenu.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>سنتر النجاح التعليمي</Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>{user?.fullName?.[0]}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.fullName} ({user?.role})</MenuItem>
            <MenuItem onClick={handleLogout}><Logout sx={{ mr: 1 }} />تسجيل الخروج</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth } }}>
        {drawer}
      </Drawer>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
