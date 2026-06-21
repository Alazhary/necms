import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, School, SupervisorAccount,
  FactCheck, BookOnline, AttachMoney, Assessment, Logout,
  TrendingUp, CalendarMonth
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

interface MenuItemType {
  text: string;
  icon: JSX.Element;
  path: string;
  roles: string[];
}

const menuItems: MenuItemType[] = [
  { text: 'لوحة التحكم', icon: <Dashboard />, path: '/dashboard', roles: ['Owner', 'Supervisor', 'Teacher'] },
  { text: 'الطلاب', icon: <People />, path: '/students', roles: ['Owner', 'Supervisor'] },
  { text: 'المدرسين', icon: <School />, path: '/teachers', roles: ['Owner'] },
  { text: 'المشرفات', icon: <SupervisorAccount />, path: '/supervisors', roles: ['Owner'] },
  { text: 'الحضور', icon: <FactCheck />, path: '/attendance', roles: ['Owner', 'Supervisor'] },
  { text: 'الامتحانات', icon: <BookOnline />, path: '/exams', roles: ['Owner', 'Supervisor', 'Teacher'] },
  { text: 'المتابعة', icon: <TrendingUp />, path: '/followups', roles: ['Owner', 'Supervisor'] },
  { text: 'الحسابات', icon: <AttachMoney />, path: '/finance', roles: ['Owner'] },
  { text: 'التقارير', icon: <Assessment />, path: '/reports', roles: ['Owner'] },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = menuItems.filter(item => hasRole(...item.roles));

  const drawer = (
    <Box sx={{ textAlign: 'right' }}>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>سنتر النجاح</Typography>
        <Typography variant="caption">نظام الإدارة المتكامل</Typography>
      </Box>
      <Divider />
      <List>
        {filteredItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{ textAlign: 'right', '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' } }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, mr: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body1" sx={{ ml: 1 }}>{user?.fullName}</Typography>
          <Avatar sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
            {user?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.role}</MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); navigate('/login'); }}>
              <Logout sx={{ ml: 1 }} /> تسجيل الخروج
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
