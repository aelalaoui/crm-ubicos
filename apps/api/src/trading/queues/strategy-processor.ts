import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { TradingService } from '../trading.service';

@Processor('strategy-execution')
export class StrategyProcessor {
  private readonly logger = new Logger(StrategyProcessor.name);

  constructor(private tradingService: TradingService) {}

  @Process('execute-strategy')
  async handleStrategyExecution(job: Job) {
    this.logger.log(`Processing strategy execution job: ${job.id}`);

    try {
      const { strategyId } = job.data;
      await this.tradingService.startStrategy(strategyId);
      return { success: true, strategyId };
    } catch (error) {
      this.logger.error(`Error processing strategy execution:`, error);
      throw error;
    }
  }

  @Process('check-positions')
  async handlePositionCheck(job: Job) {
    this.logger.log(`Processing position check job: ${job.id}`);

    try {
      const { strategyId } = job.data;
      const metrics = await this.tradingService.getStrategyMetrics(strategyId);
      return { success: true, metrics };
    } catch (error) {
      this.logger.error(`Error processing position check:`, error);
      throw error;
    }
  }

  @Process('stop-strategy')
  async handleStrategyStop(job: Job) {
    this.logger.log(`Processing strategy stop job: ${job.id}`);

    try {
      const { strategyId } = job.data;
      await this.tradingService.stopStrategy(strategyId);
      return { success: true, strategyId };
    } catch (error) {
      this.logger.error(`Error processing strategy stop:`, error);
      throw error;
    }
  }
}
