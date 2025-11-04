import { apiClient } from './client';
import { AxiosError } from 'axios';

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
    try {
      console.log('Registering with:', data);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);

      console.log('Register response:', response.data);
      return response.data.data;
    } catch (error: AxiosError | unknown) {
      const axiosError = error as AxiosError;
      console.error('Register error:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
      });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    try {
      console.log('Logging in with:', data);

      const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', data);

      console.log('Login response:', response.data);
      return response.data.data;
    } catch (error: AxiosError | unknown) {
      const axiosError = error as AxiosError;
      console.error('Login error:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error: AxiosError | unknown) {
      const axiosError = error as AxiosError;
      console.error('Logout error:', axiosError);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error: AxiosError | unknown) {
      const axiosError = error as AxiosError;
      console.error('Refresh token error:', axiosError);
      throw error;
    }
  },
};
