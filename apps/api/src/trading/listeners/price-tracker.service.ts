import { Injectable, Logger } from '@nestjs/common';
import { HeliusService } from '../../helius/helius.service';
import { PositionManagerService } from '../executors/position-manager.service';

@Injectable()
export class PriceTrackerService {
  private readonly logger = new Logger(PriceTrackerService.name);
  private trackedTokens: Map<string, Set<string>> = new Map();
  private priceUpdateCallbacks: Map<string, (price: number) => void> = new Map();

  constructor(
    private heliusService: HeliusService,
    private positionManager: PositionManagerService,
  ) {}

  async startTracking(
    tokenAddress: string,
    callback?: (price: number) => void,
  ): Promise<void> {
    this.logger.log(`Starting price tracking for ${tokenAddress}`);

    if (callback) {
      this.priceUpdateCallbacks.set(tokenAddress, callback);
    }

    if (!this.trackedTokens.has(tokenAddress)) {
      this.trackedTokens.set(tokenAddress, new Set());
      this.startPricePolling(tokenAddress);
    }
  }

  async stopTracking(tokenAddress: string): Promise<void> {
    this.logger.log(`Stopping price tracking for ${tokenAddress}`);
    this.trackedTokens.delete(tokenAddress);
    this.priceUpdateCallbacks.delete(tokenAddress);
  }

  private async startPricePolling(tokenAddress: string): Promise<void> {
    const pollInterval = 5000;

    const poll = async () => {
      try {
        const price = await this.heliusService.getTokenPrice(tokenAddress);
        const callback = this.priceUpdateCallbacks.get(tokenAddress);

        if (callback) {
          callback(price);
        }

        if (this.trackedTokens.has(tokenAddress)) {
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        this.logger.error(
          `Error polling price for ${tokenAddress}:`,
          error,
        );
        if (this.trackedTokens.has(tokenAddress)) {
          setTimeout(poll, pollInterval);
        }
      }
    };

    poll();
  }
}
