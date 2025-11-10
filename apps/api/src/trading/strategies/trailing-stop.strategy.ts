import { Injectable } from '@nestjs/common';
import { BaseStrategy } from './base-strategy';
import { TrailingStopConfig } from '../dto/execute-trade.dto';
import { PositionManagerService } from '../executors/position-manager.service';
import { OrderExecutorService } from '../executors/order-executor.service';

@Injectable()
export class TrailingStopStrategy extends BaseStrategy {
  private ath: Map<string, number> = new Map();
  private stopLossPrice: Map<string, number> = new Map();

  constructor(
    private positionManager: PositionManagerService,
    private orderExecutor: OrderExecutorService,
  ) {
    super();
  }

  async execute(strategyId: string, config: TrailingStopConfig): Promise<void> {
    this.logger.log(`Starting TrailingStopStrategy for ${strategyId}`);

    try {
      const position = await this.positionManager.getPosition(config.positionId);
      if (!position) {
        throw new Error(`Position ${config.positionId} not found`);
      }

      const activationPrice =
        config.activationMultiplier && config.activationMultiplier > 1
          ? position.entryPrice * config.activationMultiplier
          : position.entryPrice;

      this.ath.set(config.positionId, activationPrice);
      this.stopLossPrice.set(
        config.positionId,
        activationPrice * (1 - config.trailPercent / 100),
      );

      await this.monitorTrailingStop(strategyId, config, position);
    } catch (error) {
      this.logger.error(`Error in TrailingStopStrategy:`, error);
      throw error;
    }
  }

  private async monitorTrailingStop(
    strategyId: string,
    config: TrailingStopConfig,
    position: any,
  ): Promise<void> {
    const checkInterval = 5000;
    const maxWaitTime = 30 * 24 * 60 * 60 * 1000;
    const startTime = Date.now();

    const checkStop = async () => {
      try {
        const currentPrice = await this.positionManager.getCurrentPrice(
          position.tokenAddress,
        );

        const currentAth = this.ath.get(config.positionId) || position.entryPrice;
        const currentStopLoss =
          this.stopLossPrice.get(config.positionId) ||
          currentAth * (1 - config.trailPercent / 100);

        if (currentPrice > currentAth) {
          this.ath.set(config.positionId, currentPrice);
          this.stopLossPrice.set(
            config.positionId,
            currentPrice * (1 - config.trailPercent / 100),
          );
          this.logger.log(
            `ATH updated to ${currentPrice}, new stop loss at ${currentPrice * (1 - config.trailPercent / 100)}`,
          );
        }

        if (currentPrice <= currentStopLoss) {
          this.logger.log(
            `Stop loss triggered at ${currentPrice}, selling position`,
          );

          const order = await this.orderExecutor.executeSell({
            walletId: position.walletId,
            tokenAddress: position.tokenAddress,
            quantity: position.quantity,
            slippage: 2,
            strategyId,
          });

          await this.positionManager.closePosition(config.positionId, currentPrice);

          await this.logExecution(strategyId, 'success', {
            positionId: config.positionId,
            stopLossPrice: currentStopLoss,
            exitPrice: currentPrice,
            order,
          });

          await this.notifyUser(strategyId, 'stop_loss_triggered', {
            tokenAddress: position.tokenAddress,
            exitPrice: currentPrice,
            pnl: (currentPrice - position.entryPrice) * position.quantity,
          });

          return;
        }

        if (Date.now() - startTime < maxWaitTime) {
          setTimeout(checkStop, checkInterval);
        }
      } catch (error) {
        this.logger.error(`Error monitoring trailing stop:`, error);
        setTimeout(checkStop, checkInterval);
      }
    };

    checkStop();
  }
}
