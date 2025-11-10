import { Injectable } from '@nestjs/common';
import { BaseStrategy } from './base-strategy';
import { GridSellingConfig } from '../dto/execute-trade.dto';
import { PositionManagerService } from '../executors/position-manager.service';
import { OrderExecutorService } from '../executors/order-executor.service';

@Injectable()
export class GridSellingStrategy extends BaseStrategy {
  constructor(
    private positionManager: PositionManagerService,
    private orderExecutor: OrderExecutorService,
  ) {
    super();
  }

  async execute(strategyId: string, config: GridSellingConfig): Promise<void> {
    this.logger.log(`Starting GridSellingStrategy for ${strategyId}`);

    try {
      if (!config.positionId) {
        throw new Error('Position ID is required for grid selling strategy');
      }

      const positionId = config.positionId as string;
      const position = await this.positionManager.getPosition(positionId);
      if (!position) {
        throw new Error(`Position ${positionId} not found`);
      }

      const startPrice = position.entryPrice;

      for (const target of config.targets) {
        const targetPrice = startPrice * target.priceMultiplier;
        const sellQuantity = (position.quantity * target.sellPercent) / 100;

        this.logger.log(
          `Grid selling: waiting for price ${targetPrice} to sell ${sellQuantity} tokens`,
        );

        await this.waitForPriceTarget(
          position.tokenAddress,
          targetPrice,
          async () => {
            try {
              const order = await this.orderExecutor.executeSell({
                walletId: position.walletId,
                tokenAddress: position.tokenAddress,
                amount: sellQuantity,
                slippage: 2,
                strategyId: strategyId!,
              });

              await this.positionManager.updatePosition(positionId, {
                quantity: position.quantity - sellQuantity,
              });

              await this.logExecution(strategyId, 'success', {
                positionId: positionId,
                targetPrice,
                sellQuantity,
                order,
              });

              await this.notifyUser(strategyId, 'grid_sell_executed', {
                tokenAddress: position.tokenAddress,
                quantity: sellQuantity,
                price: order.price,
                pnl: (order.price - position.entryPrice) * sellQuantity,
              });
            } catch (error) {
              this.logger.error(`Error executing grid sell:`, error);
              await this.logExecution(strategyId, 'failed', error);
            }
          },
        );
      }
    } catch (error) {
      this.logger.error(`Error in GridSellingStrategy:`, error);
      throw error;
    }
  }

  private async waitForPriceTarget(
    tokenAddress: string,
    targetPrice: number,
    callback: () => Promise<void>,
  ): Promise<void> {
    const checkInterval = 10000;
    const maxWaitTime = 30 * 24 * 60 * 60 * 1000;
    const startTime = Date.now();

    const checkPrice = async () => {
      try {
        const currentPrice = await this.positionManager.getCurrentPrice(
          tokenAddress,
        );

        if (currentPrice >= targetPrice) {
          await callback();
          return;
        }

        if (Date.now() - startTime > maxWaitTime) {
          this.logger.warn(
            `Price target ${targetPrice} not reached within ${maxWaitTime}ms`,
          );
          return;
        }

        setTimeout(checkPrice, checkInterval);
      } catch (error) {
        this.logger.error(`Error checking price:`, error);
        setTimeout(checkPrice, checkInterval);
      }
    };

    await checkPrice();
  }
}

