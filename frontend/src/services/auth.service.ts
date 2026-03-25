import { api } from '@/lib/api';

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const authApi = {
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto);
    return data;
  },

  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', dto);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
