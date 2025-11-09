import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  SniperooCreateWalletResponse,
  SniperooWallet,
  SniperooTradeParams,
  SniperooTradeResponse,
  SniperooListWalletsResponse,
  SniperooListPositionsResponse,
  SniperooListOrdersResponse,
  SniperooErrorResponse,
} from './interfaces/sniperoo.types';

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

@Injectable()
export class SniperooService {
  private readonly client: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly logger = new Logger(SniperooService.name);
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  };

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('SNIPEROO_API_URL') || 'https://api.sniperoo.app';
    this.apiKey = this.configService.get<string>('SNIPEROO_API_KEY') || '';

    if (!this.apiKey) {
      this.logger.warn(
        'SNIPEROO_API_KEY is not configured. Wallet creation will fail. ' +
        'Please set SNIPEROO_API_KEY environment variable.',
      );
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 30000,
    });

    this.logger.log(`SniperooService initialized with API URL: ${this.apiUrl}`);
  }

  private async retryRequest<T>(fn: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;

        if (attempt < this.retryConfig.maxRetries) {
          const delay =
            this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt);
          this.logger.warn(
            `${operationName} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}), retrying in ${delay}ms`,
            axiosError.message,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `${operationName} failed after ${this.retryConfig.maxRetries + 1} attempts`,
      lastError?.message,
    );
    throw lastError;
  }

  private handleError(error: unknown, operation: string): never {
    const axiosError = error as AxiosError<SniperooErrorResponse>;

    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      this.logger.error(`${operation} error:`, errorData);
      throw new BadRequestException(errorData.message || errorData.error);
    }

    if (axiosError.message) {
      this.logger.error(`${operation} error:`, axiosError.message);
      throw new InternalServerErrorException(axiosError.message);
    }

    throw new InternalServerErrorException(`${operation} failed`);
  }

  async createWallet(name: string): Promise<SniperooCreateWalletResponse> {
    return this.retryRequest(async () => {
      try {
        const response = await this.client.post<any>('/user/wallets', {
          name,
        });
        this.logger.log(`Wallet API Response:`, JSON.stringify(response.data));

        // Handle different response formats
        let walletData = response.data;
        if (response.data.data) {
          walletData = response.data.data;
        }

        // If wallet is nested under 'wallet' property
        if (walletData.wallet) {
          this.logger.log(`Wallet created: ${walletData.wallet.id}`);
          return {
            wallet: walletData.wallet,
            privateKey: walletData.privateKey,
          };
        }

        // If response is already in the right format
        if (walletData.id && walletData.privateKey) {
          this.logger.log(`Wallet created: ${walletData.id}`);
          return {
            wallet: walletData,
            privateKey: walletData.privateKey,
          };
        }

        throw new Error(`Unexpected response format: ${JSON.stringify(response.data)}`);
      } catch (error) {
        const axiosError = error as AxiosError;
        this.logger.error(
          `createWallet request failed: ${axiosError.message}`,
        );
        if (axiosError.response?.data) {
          this.logger.error(`Response data:`, JSON.stringify(axiosError.response.data));
        }
        throw error;
      }
    }, 'createWallet');
  }

  async importWallet(name: string, privateKey: string): Promise<SniperooWallet> {
    return this.retryRequest(async () => {
      const response = await this.client.post<SniperooWallet>('/user/wallets/import', {
        name,
        privateKey,
      });
      this.logger.log(`Wallet imported: ${response.data.id}`);
      return response.data;
    }, 'importWallet');
  }

  async getWallet(walletId: string): Promise<SniperooWallet> {
    return this.retryRequest(async () => {
      const response = await this.client.get<SniperooWallet>(`/user/wallets/${walletId}`);
      return response.data;
    }, `getWallet(${walletId})`);
  }

  async listWallets(): Promise<SniperooListWalletsResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.get<SniperooListWalletsResponse>('/user/wallets');
      return response.data;
    }, 'listWallets');
  }

  async deleteWallet(walletId: string): Promise<void> {
    return this.retryRequest(async () => {
      await this.client.delete(`/user/wallets/${walletId}`);
      this.logger.log(`Wallet deleted: ${walletId}`);
    }, `deleteWallet(${walletId})`);
  }

  async getWalletBalance(walletId: string): Promise<number> {
    return this.retryRequest(async () => {
      const response = await this.client.get<{ balance: number }>(`/user/wallets/${walletId}/balance`);
      return response.data.balance;
    }, `getWalletBalance(${walletId})`);
  }

  async buy(params: SniperooTradeParams): Promise<SniperooTradeResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.post<SniperooTradeResponse>('/user/orders/buy', params);
      this.logger.log(`Buy order created: ${response.data.signature}`);
      return response.data;
    }, 'buy');
  }

  async sell(params: SniperooTradeParams): Promise<SniperooTradeResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.post<SniperooTradeResponse>('/user/orders/sell', params);
      this.logger.log(`Sell order created: ${response.data.signature}`);
      return response.data;
    }, 'sell');
  }

  async getPositions(walletId?: string): Promise<SniperooListPositionsResponse> {
    return this.retryRequest(async () => {
      const params = walletId ? { walletId } : {};
      const response = await this.client.get<SniperooListPositionsResponse>('/user/positions', {
        params,
      });
      return response.data;
    }, 'getPositions');
  }

  async getOrders(walletId?: string): Promise<SniperooListOrdersResponse> {
    return this.retryRequest(async () => {
      const params = walletId ? { walletId } : {};
      const response = await this.client.get<SniperooListOrdersResponse>('/user/orders', { params });
      return response.data;
    }, 'getOrders');
  }

  async closePosition(positionId: string): Promise<SniperooTradeResponse> {
    return this.retryRequest(async () => {
      const response = await this.client.post<SniperooTradeResponse>(
        `/user/positions/${positionId}/close`,
      );
      this.logger.log(`Position closed: ${positionId}`);
      return response.data;
    }, `closePosition(${positionId})`);
  }
}
