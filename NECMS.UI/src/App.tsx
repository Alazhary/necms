import type React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';
import { CircularProgress, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import TeachersPage from './pages/TeachersPage';
import SupervisorsPage from './pages/SupervisorsPage';
import AttendancePage from './pages/AttendancePage';
import ExamsPage from './pages/ExamsPage';
import FinancePage from './pages/FinancePage';
import FollowUpsPage from './pages/FollowUpsPage';
import ReportsPage from './pages/ReportsPage';
import PortalPage from './pages/PortalPage';
import MainLayout from './layouts/MainLayout';
import './App.css';

function PrivateRoute({ children, roles }: { children: React.JSX.Element; roles?: string[] }) {
  const { isAuthenticated, hasRole, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !hasRole(...roles)) return <Navigate to="/dashboard" />;
  return children;
}

function PublicRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/portal/:code" element={<PortalPage />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="students" element={<PrivateRoute roles={['Owner', 'Supervisor']}><StudentsPage /></PrivateRoute>} />
        <Route path="students/:id" element={<PrivateRoute roles={['Owner', 'Supervisor']}><StudentDetailPage /></PrivateRoute>} />
        <Route path="teachers" element={<PrivateRoute roles={['Owner']}><TeachersPage /></PrivateRoute>} />
        <Route path="supervisors" element={<PrivateRoute roles={['Owner']}><SupervisorsPage /></PrivateRoute>} />
        <Route path="attendance" element={<PrivateRoute roles={['Owner', 'Supervisor']}><AttendancePage /></PrivateRoute>} />
        <Route path="exams" element={<PrivateRoute roles={['Owner', 'Supervisor', 'Teacher']}><ExamsPage /></PrivateRoute>} />
        <Route path="finance" element={<PrivateRoute roles={['Owner']}><FinancePage /></PrivateRoute>} />
        <Route path="followups" element={<PrivateRoute roles={['Owner', 'Supervisor']}><FollowUpsPage /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute roles={['Owner']}><ReportsPage /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
