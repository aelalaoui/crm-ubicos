import { apiClient } from './client';

export interface Wallet {
  id: string;
  name: string;
  publicKey: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateWalletData {
  name: string;
}

export interface ImportWalletData {
  name: string;
  privateKey: string;
}

export const walletsApi = {
  getAll: async () => {
    const response = await apiClient.get<{ data: Wallet[] }>('/wallets');
    return response.data.data;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get<{ data: Wallet }>(`/wallets/${id}`);
    return response.data.data;
  },

  create: async (data: CreateWalletData) => {
    const response = await apiClient.post<{ data: Wallet }>('/wallets', data);
    return response.data.data;
  },

  import: async (data: ImportWalletData) => {
    const response = await apiClient.post<{ data: Wallet }>('/wallets/import', data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/wallets/${id}`);
    return response.data;
  },
};
