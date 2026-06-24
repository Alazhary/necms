import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../supabase';
import { getProfile } from '../services/api';
import { authService } from '../services/authService';
import type { UserInfo } from '../services/authService';

interface AuthContextType {
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setUser({
            userId: session.user.id,
            fullName: profile.full_name,
            role: profile.roles?.name || 'parent',
            profileId: session.user.id,
          });
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUser({
              userId: session.user.id,
              fullName: profile.full_name,
              role: profile.roles?.name || 'parent',
              profileId: session.user.id,
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: authUser, profile } = await authService.login(email, password);
    setUser({
      userId: authUser.id,
      fullName: profile.full_name,
      role: profile.roles?.name || 'parent',
      profileId: authUser.id,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasRole = (...roles: string[]) => {
    if (!user) return false;
    return roles.some(r => r.toLowerCase() === user.role.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading,
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
