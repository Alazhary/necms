import api from './api';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: string;
  userId: number;
  studentId?: number;
  parentId?: number;
}

export interface UserInfo {
  userId: number;
  fullName: string;
  role: string;
  studentId?: number;
  parentId?: number;
}

export const authService = {
  async login(dto: LoginDto): Promise<LoginResponse> {
    const res = await api.post('/auth/login', dto);
    return res.data;
  },

  async getMe(): Promise<UserInfo> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  },
};
