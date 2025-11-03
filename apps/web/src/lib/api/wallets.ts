import axios, { AxiosInstance } from 'axios';
import { Wallet, CreateWalletInput, ImportWalletInput, WalletBalance } from '../types/wallet.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class WalletAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/wallets`,
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async fetchWallets(): Promise<Wallet[]> {
    const response = await this.client.get<Wallet[]>('/');
    return response.data;
  }

  async createWallet(data: CreateWalletInput): Promise<Wallet> {
    const response = await this.client.post<Wallet>('/', data);
    return response.data;
  }

  async importWallet(data: ImportWalletInput): Promise<Wallet> {
    const response = await this.client.post<Wallet>('/import', data);
    return response.data;
  }

  async deleteWallet(id: string): Promise<void> {
    await this.client.delete(`/${id}`);
  }

  async getWalletBalance(id: string): Promise<WalletBalance> {
    const response = await this.client.get<WalletBalance>(`/${id}/balance`);
    return response.data;
  }

  async getWallet(id: string): Promise<Wallet> {
    const response = await this.client.get<Wallet>(`/${id}`);
    return response.data;
  }
}

export const walletAPI = new WalletAPI();
