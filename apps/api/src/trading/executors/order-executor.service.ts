import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SniperooService } from '../../sniperoo/sniperoo.service';
import { OrderResult } from '../dto/trading.types';
import { ExecuteTradeDto } from '../dto/execute-trade.dto';

@Injectable()
export class OrderExecutorService {
  private readonly logger = new Logger(OrderExecutorService.name);
  private readonly maxTradesPerMinute = 10;
  private tradeTimestamps: Map<string, number[]> = new Map();

  constructor(
    private prisma: PrismaService,
    private sniperooService: SniperooService,
  ) {}

  async executeBuy(dto: ExecuteTradeDto): Promise<OrderResult> {
    this.logger.log(`Executing buy order: ${JSON.stringify(dto)}`);

    await this.checkRateLimit(dto.walletId);
    await this.validateWalletBalance(dto.walletId, dto.amount);

    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: dto.walletId },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      if (!wallet.sniperooWalletId) {
        throw new BadRequestException('Sniperoo wallet ID not configured');
      }

      const result = await this.sniperooService.buy({
        walletId: wallet.sniperooWalletId,
        tokenAddress: dto.tokenAddress,
        amount: dto.amount,
        slippage: dto.slippage,
      });

      const transaction = await this.prisma.transaction.create({
        data: {
          walletId: dto.walletId,
          type: 'BUY',
          signature: result.signature,
          tokenAddress: dto.tokenAddress,
          amount: dto.amount,
          price: result.price || 0,
          totalValue: result.amount || 0,
          fee: result.fee || 0,
          status: 'CONFIRMED',
          blockTime: new Date(),
        },
      });

      this.recordTrade(dto.walletId);

      return {
        signature: result.signature,
        tokenAddress: dto.tokenAddress,
        amount: dto.amount,
        price: result.price || 0,
        quantity: result.quantity || 0,
        fee: result.fee || 0,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error executing buy order:`, error);
      throw error;
    }
  }

  async executeSell(dto: ExecuteTradeDto): Promise<OrderResult> {
    this.logger.log(`Executing sell order: ${JSON.stringify(dto)}`);

    await this.checkRateLimit(dto.walletId);

    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: dto.walletId },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      if (!wallet.sniperooWalletId) {
        throw new BadRequestException('Sniperoo wallet ID not configured');
      }

      const result = await this.sniperooService.sell({
        walletId: wallet.sniperooWalletId,
        tokenAddress: dto.tokenAddress,
        amount: dto.amount,
        slippage: dto.slippage,
      });

      const transaction = await this.prisma.transaction.create({
        data: {
          walletId: dto.walletId,
          type: 'SELL',
          signature: result.signature,
          tokenAddress: dto.tokenAddress,
          amount: dto.amount,
          price: result.price || 0,
          totalValue: result.amount || 0,
          fee: result.fee || 0,
          status: 'CONFIRMED',
          blockTime: new Date(),
        },
      });

      this.recordTrade(dto.walletId);

      return {
        signature: result.signature,
        tokenAddress: dto.tokenAddress,
        amount: dto.amount,
        price: result.price || 0,
        quantity: result.quantity || 0,
        fee: result.fee || 0,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error executing sell order:`, error);
      throw error;
    }
  }

  private async checkRateLimit(walletId: string): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const timestamps = this.tradeTimestamps.get(walletId) || [];
    const recentTrades = timestamps.filter((ts) => ts > oneMinuteAgo);

    if (recentTrades.length >= this.maxTradesPerMinute) {
      throw new BadRequestException(
        `Rate limit exceeded: maximum ${this.maxTradesPerMinute} trades per minute`,
      );
    }
  }

  private recordTrade(walletId: string): void {
    const now = Date.now();
    const timestamps = this.tradeTimestamps.get(walletId) || [];
    timestamps.push(now);
    this.tradeTimestamps.set(walletId, timestamps);
  }

  private async validateWalletBalance(
    walletId: string,
    requiredAmount: number,
  ): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet || wallet.balance < requiredAmount) {
      throw new BadRequestException(
        `Insufficient balance. Required: ${requiredAmount}, Available: ${wallet?.balance || 0}`,
      );
    }
  }
}

