import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  SniperooCreateWalletResponse,
  SniperooWallet,
  SniperooTradeParams,
  SniperooTradeResponse,
} from './interfaces/sniperoo.types';

@Injectable()
export class SniperooService {
  private readonly client: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('SNIPEROO_API_URL') || '';
    this.apiKey = this.configService.get<string>('SNIPEROO_API_KEY') || '';

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async createWallet(): Promise<SniperooCreateWalletResponse> {
    throw new Error('Sniperoo integration not implemented yet (Phase 2)');
  }

  async importWallet(privateKey: string): Promise<SniperooWallet> {
    throw new Error('Sniperoo integration not implemented yet (Phase 2)');
  }

  async getWallet(walletId: string): Promise<SniperooWallet> {
    throw new Error('Sniperoo integration not implemented yet (Phase 2)');
  }

  async buy(params: SniperooTradeParams): Promise<SniperooTradeResponse> {
    throw new Error('Sniperoo integration not implemented yet (Phase 2)');
  }

  async sell(params: SniperooTradeParams): Promise<SniperooTradeResponse> {
    throw new Error('Sniperoo integration not implemented yet (Phase 2)');
  }
}
