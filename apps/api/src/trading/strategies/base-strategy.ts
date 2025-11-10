import { Logger } from '@nestjs/common';
import { StrategyMetrics, StrategyExecution } from '../dto/trading.types';

export abstract class BaseStrategy {
  protected logger = new Logger(this.constructor.name);
  protected metrics: StrategyMetrics = {
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalVolume: 0,
    realizedPnL: 0,
    unrealizedPnL: 0,
    winRate: 0,
    averageProfit: 0,
    largestWin: 0,
    largestLoss: 0,
    activePositions: 0,
    lastExecutionAt: new Date(),
  };

  abstract execute(strategyId: string, config: any): Promise<void>;

  protected updateMetrics(execution: StrategyExecution): void {
    this.metrics.totalTrades += execution.trades.length;
    this.metrics.lastExecutionAt = execution.executedAt;

    if (execution.status === 'success') {
      this.metrics.successfulTrades += execution.trades.length;
    } else if (execution.status === 'failed') {
      this.metrics.failedTrades += execution.trades.length;
    }

    for (const trade of execution.trades) {
      this.metrics.totalVolume += trade.amount;
    }

    this.metrics.winRate =
      this.metrics.totalTrades > 0
        ? (this.metrics.successfulTrades / this.metrics.totalTrades) * 100
        : 0;
  }

  protected getMetrics(): StrategyMetrics {
    return this.metrics;
  }

  protected async logExecution(
    strategyId: string,
    status: 'success' | 'failed',
    data: any,
  ): Promise<void> {
    this.logger.log(
      `Strategy ${strategyId} execution ${status}: ${JSON.stringify(data)}`,
    );
  }

  protected async notifyUser(
    strategyId: string,
    event: string,
    data: any,
  ): Promise<void> {
    this.logger.log(
      `Notification for strategy ${strategyId} - Event: ${event}, Data: ${JSON.stringify(data)}`,
    );
  }
}
