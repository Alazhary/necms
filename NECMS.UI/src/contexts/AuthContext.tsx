import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { UserInfo } from '../services/authService';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login({ username, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify({
      userId: res.userId,
      fullName: res.fullName,
      role: res.role,
      studentId: res.studentId,
      parentId: res.parentId,
    }));
    setToken(res.token);
    setUser({
      userId: res.userId,
      fullName: res.fullName,
      role: res.role,
      studentId: res.studentId,
      parentId: res.parentId,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: string[]) => {
    if (!user) return false;
    return roles.some(r => r.toLowerCase() === user.role.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
