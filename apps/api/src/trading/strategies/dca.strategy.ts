import { Injectable } from '@nestjs/common';
import { BaseStrategy } from './base-strategy';
import { DCAConfig } from '../dto/execute-trade.dto';
import { OrderExecutorService } from '../executors/order-executor.service';
import { PositionManagerService } from '../executors/position-manager.service';

@Injectable()
export class DCAStrategy extends BaseStrategy {
  constructor(
    private orderExecutor: OrderExecutorService,
    private positionManager: PositionManagerService,
  ) {
    super();
  }

  async execute(strategyId: string, config: DCAConfig): Promise<void> {
    this.logger.log(`Starting DCAStrategy for ${strategyId}`);

    try {
      const intervalMs = config.intervalHours * 60 * 60 * 1000;
      let buysExecuted = 0;

      const executeBuy = async () => {
        if (buysExecuted >= config.totalBuys) {
          this.logger.log(
            `DCA strategy completed: ${buysExecuted} buys executed`,
          );
          return;
        }

        try {
          const order = await this.orderExecutor.executeBuy({
            walletId: config.walletId,
            tokenAddress: config.tokenAddress,
            amount: config.buyAmount,
            slippage: 2,
            strategyId,
          });

          const position = await this.positionManager.createOrUpdatePosition({
            walletId: config.walletId,
            tokenAddress: config.tokenAddress,
            entryPrice: order.price,
            quantity: order.quantity,
            strategyId,
          });

          buysExecuted++;

          await this.logExecution(strategyId, 'success', {
            buyNumber: buysExecuted,
            order,
            position: position.id,
          });

          await this.notifyUser(strategyId, 'dca_buy_executed', {
            buyNumber: buysExecuted,
            totalBuys: config.totalBuys,
            tokenAddress: config.tokenAddress,
            amount: order.amount,
            price: order.price,
            quantity: order.quantity,
          });

          if (buysExecuted < config.totalBuys) {
            setTimeout(executeBuy, intervalMs);
          }
        } catch (error) {
          this.logger.error(`Error executing DCA buy:`, error);
          await this.logExecution(strategyId, 'failed', error);
          setTimeout(executeBuy, intervalMs);
        }
      };

      executeBuy();
    } catch (error) {
      this.logger.error(`Error in DCAStrategy:`, error);
      throw error;
    }
  }
}
