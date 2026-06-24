import { supabase } from '../supabase';
import { getProfile } from './api';

export interface UserInfo {
  userId: string;
  fullName: string;
  role: string;
  studentId?: number;
  parentId?: number;
  profileId?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: any; profile: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await getProfile(data.user.id);
    if (!profile) throw new Error('الملف الشخصي غير موجود');

    return { user: data.user, profile };
  },

  async signUp(email: string, password: string, fullName: string, roleId: number = 4) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role_id: roleId },
      },
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getMe(): Promise<UserInfo | null> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    const profile = await getProfile(user.data.user.id);
    if (!profile) return null;

    return {
      userId: user.data.user.id,
      fullName: profile.full_name,
      role: profile.roles?.name || 'parent',
      studentId: undefined,
      parentId: undefined,
      profileId: user.data.user.id,
    };
  },

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};
