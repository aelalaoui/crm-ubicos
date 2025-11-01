import { apiClient } from './client';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    plan: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },
};
