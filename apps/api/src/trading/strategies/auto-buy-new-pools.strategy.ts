import { Injectable } from '@nestjs/common';
import { BaseStrategy } from './base-strategy';
import { HeliusService } from '../../helius/helius.service';
import { OrderExecutorService } from '../executors/order-executor.service';
import { PositionManagerService } from '../executors/position-manager.service';
import { AutoBuyConfig } from '../dto/execute-trade.dto';

@Injectable()
export class AutoBuyNewPoolsStrategy extends BaseStrategy {
  constructor(
    private heliusService: HeliusService,
    private orderExecutor: OrderExecutorService,
    private positionManager: PositionManagerService,
  ) {
    super();
  }

  async execute(strategyId: string, config: AutoBuyConfig): Promise<void> {
    this.logger.log(`Starting AutoBuyNewPoolsStrategy for ${strategyId}`);

    try {
      await this.heliusService.subscribeNewPools(async (pool) => {
        try {
          if (pool.liquidity < config.minLiquidity) {
            this.logger.debug(
              `Pool ${pool.address} liquidity ${pool.liquidity} below minimum ${config.minLiquidity}`,
            );
            return;
          }

          if (pool.liquidity > config.maxLiquidity) {
            this.logger.debug(
              `Pool ${pool.address} liquidity ${pool.liquidity} above maximum ${config.maxLiquidity}`,
            );
            return;
          }

          if (config.rugCheckEnabled) {
            const isValid = await this.validateToken(pool.tokenAddress, config);
            if (!isValid) {
              this.logger.warn(`Token ${pool.tokenAddress} failed rug check`);
              return;
            }
          }

          const order = await this.orderExecutor.executeBuy({
            walletId: config.walletId,
            tokenAddress: pool.tokenAddress,
            amount: config.buyAmount,
            slippage: config.slippage,
            strategyId,
          });

          const position = await this.positionManager.createPosition({
            walletId: config.walletId,
            tokenAddress: pool.tokenAddress,
            entryPrice: order.price,
            quantity: order.quantity,
            strategyId,
          });

          await this.logExecution(strategyId, 'success', {
            pool: pool.address,
            order,
            position: position.id,
          });

          await this.notifyUser(strategyId, 'buy_executed', {
            tokenAddress: pool.tokenAddress,
            amount: order.amount,
            price: order.price,
            quantity: order.quantity,
          });
        } catch (error) {
          this.logger.error(
            `Error executing buy for pool ${pool.address}:`,
            error,
          );
          await this.logExecution(strategyId, 'failed', error);
        }
      });
    } catch (error) {
      this.logger.error(`Error in AutoBuyNewPoolsStrategy:`, error);
      throw error;
    }
  }

  private async validateToken(
    tokenAddress: string,
    config: AutoBuyConfig,
  ): Promise<boolean> {
    try {
      const tokenInfo = await this.heliusService.getTokenInfo(tokenAddress);

      if (
        tokenInfo.liquidityLocked < config.minLiquidityLocked ||
        tokenInfo.top10Holdings > config.maxTop10Holdings
      ) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validating token ${tokenAddress}:`, error);
      return false;
    }
  }
}
