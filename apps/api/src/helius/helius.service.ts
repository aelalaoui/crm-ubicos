import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RaydiumPool, TokenInfo } from '../dto/trading.types';

@Injectable()
export class HeliusService {
  private readonly logger = new Logger(HeliusService.name);
  private readonly heliusApiKey: string;
  private readonly heliusApiUrl = 'https://api.helius.xyz/v0';
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private configService: ConfigService) {
    this.heliusApiKey = this.configService.get<string>('HELIUS_API_KEY') || '';
  }

  async subscribeNewPools(callback: (pool: RaydiumPool) => void): Promise<void> {
    try {
      const wsUrl = `wss://api.helius.xyz/?api-key=${this.heliusApiKey}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.logger.log('Connected to Helius WebSocket');
        this.reconnectAttempts = 0;

        const subscription = {
          jsonrpc: '2.0',
          id: 1,
          method: 'transactionSubscribe',
          params: [
            {
              failed: false,
              accountInclude: ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1xf'],
            },
            {
              encoding: 'jsonParsed',
              transactionDetails: 'full',
              showRewards: false,
            },
          ],
        };

        this.ws.send(JSON.stringify(subscription));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.result?.transaction) {
            const pool = this.parseRaydiumPool(data.result.transaction);
            if (pool) {
              callback(pool);
            }
          }
        } catch (error) {
          this.logger.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.logger.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.logger.warn('WebSocket closed, attempting to reconnect...');
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.subscribeNewPools(callback), 5000);
        }
      };
    } catch (error) {
      this.logger.error('Error subscribing to new pools:', error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      const response = await axios.get(
        `${this.heliusApiUrl}/token-metadata?address=${tokenAddress}&api-key=${this.heliusApiKey}`,
      );

      const data = response.data;
      return {
        address: tokenAddress,
        symbol: data.symbol || 'UNKNOWN',
        name: data.name || 'Unknown Token',
        decimals: data.decimals || 6,
        supply: data.supply || 0,
        holders: data.holders || 0,
        liquidityLocked: 0,
        top10Holdings: 0,
      };
    } catch (error) {
      this.logger.error(`Error fetching token info for ${tokenAddress}:`, error);
      throw error;
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.heliusApiUrl}/token-price?address=${tokenAddress}&api-key=${this.heliusApiKey}`,
      );

      return response.data.price || 0;
    } catch (error) {
      this.logger.error(`Error fetching token price for ${tokenAddress}:`, error);
      return 0;
    }
  }

  private parseRaydiumPool(transaction: any): RaydiumPool | null {
    try {
      const instructions = transaction.message?.instructions || [];

      for (const instruction of instructions) {
        if (instruction.programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1xf') {
          const parsed = instruction.parsed;
          if (parsed?.type === 'initializePool') {
            return {
              address: parsed.info?.pool || '',
              tokenAddress: parsed.info?.tokenMint || '',
              tokenSymbol: 'NEW',
              tokenName: 'New Token',
              liquidity: 0,
              volume24h: 0,
              priceUsd: 0,
              createdAt: new Date(),
            };
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Error parsing Raydium pool:', error);
      return null;
    }
  }

  closeConnection(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}
