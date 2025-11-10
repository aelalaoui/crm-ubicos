import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HeliusService } from '../helius/helius.service';
import { OrderExecutorService } from './executors/order-executor.service';
import { PositionManagerService } from './executors/position-manager.service';
import { PriceTrackerService } from './listeners/price-tracker.service';
import { AutoBuyNewPoolsStrategy } from './strategies/auto-buy-new-pools.strategy';
import { GridSellingStrategy } from './strategies/grid-selling.strategy';
import { TrailingStopStrategy } from './strategies/trailing-stop.strategy';
import { DCAStrategy } from './strategies/dca.strategy';
import { StrategyMetrics } from './dto/trading.types';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private activeStrategies: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private heliusService: HeliusService,
    private orderExecutor: OrderExecutorService,
    private positionManager: PositionManagerService,
    private priceTracker: PriceTrackerService,
    private autoBuyStrategy: AutoBuyNewPoolsStrategy,
    private gridSellingStrategy: GridSellingStrategy,
    private trailingStopStrategy: TrailingStopStrategy,
    private dcaStrategy: DCAStrategy,
  ) {}

  async startStrategy(strategyId: string): Promise<void> {
    this.logger.log(`Starting strategy ${strategyId}`);

    try {
      const strategy = await this.prisma.tradingStrategy.findUnique({
        where: { id: strategyId },
      });

      if (!strategy) {
        throw new Error(`Strategy ${strategyId} not found`);
      }

      const config = strategy.config as any;

      let strategyInstance: any;
      switch (config.type) {
        case 'AUTO_BUY_NEW_POOLS':
          strategyInstance = this.autoBuyStrategy;
          break;
        case 'GRID_SELLING':
          strategyInstance = this.gridSellingStrategy;
          break;
        case 'TRAILING_STOP':
          strategyInstance = this.trailingStopStrategy;
          break;
        case 'DCA':
          strategyInstance = this.dcaStrategy;
          break;
        default:
          throw new Error(`Unknown strategy type: ${config.type}`);
      }

      await strategyInstance.execute(strategyId, config.params);
      this.activeStrategies.set(strategyId, strategyInstance);

      await this.prisma.tradingStrategy.update({
        where: { id: strategyId },
        data: { isActive: true },
      });
    } catch (error) {
      this.logger.error(`Error starting strategy ${strategyId}:`, error);
      throw error;
    }
  }

  async stopStrategy(strategyId: string): Promise<void> {
    this.logger.log(`Stopping strategy ${strategyId}`);

    try {
      this.activeStrategies.delete(strategyId);

      await this.prisma.tradingStrategy.update({
        where: { id: strategyId },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error(`Error stopping strategy ${strategyId}:`, error);
      throw error;
    }
  }

  async getStrategyMetrics(strategyId: string): Promise<StrategyMetrics> {
    this.logger.log(`Getting metrics for strategy ${strategyId}`);

    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          position: {
            wallet: {
              user: {
                strategies: {
                  some: { id: strategyId },
                },
              },
            },
          },
        },
      });

      const positions = await this.prisma.position.findMany({
        where: {
          wallet: {
            user: {
              strategies: {
                some: { id: strategyId },
              },
            },
          },
        },
      });

      const successfulTrades = transactions.filter(
        (t) => t.status === 'CONFIRMED',
      ).length;
      const failedTrades = transactions.filter(
        (t) => t.status === 'FAILED',
      ).length;
      const totalTrades = transactions.length;

      const totalVolume = transactions.reduce((sum, t) => sum + t.totalValue, 0);
      const realizedPnL = positions
        .filter((p) => p.status === 'CLOSED')
        .reduce((sum, p) => sum + p.realizedPnl, 0);
      const unrealizedPnL = positions
        .filter((p) => p.status === 'OPEN')
        .reduce((sum, p) => sum + p.unrealizedPnl, 0);

      const winRate =
        totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
      const averageProfit =
        successfulTrades > 0 ? realizedPnL / successfulTrades : 0;

      const closedPositions = positions.filter((p) => p.status === 'CLOSED');
      const largestWin =
        closedPositions.length > 0
          ? Math.max(...closedPositions.map((p) => p.realizedPnl))
          : 0;
      const largestLoss =
        closedPositions.length > 0
          ? Math.min(...closedPositions.map((p) => p.realizedPnl))
          : 0;

      const activePositions = positions.filter(
        (p) => p.status === 'OPEN',
      ).length;

      return {
        totalTrades,
        successfulTrades,
        failedTrades,
        totalVolume,
        realizedPnL,
        unrealizedPnL,
        winRate,
        averageProfit,
        largestWin,
        largestLoss,
        activePositions,
        lastExecutionAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting strategy metrics:`, error);
      throw error;
    }
  }
}
