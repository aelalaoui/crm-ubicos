import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TradingService } from './trading.service';
import { OrderExecutorService } from './executors/order-executor.service';
import { PositionManagerService } from './executors/position-manager.service';
import { PriceTrackerService } from './listeners/price-tracker.service';
import { AutoBuyNewPoolsStrategy } from './strategies/auto-buy-new-pools.strategy';
import { GridSellingStrategy } from './strategies/grid-selling.strategy';
import { TrailingStopStrategy } from './strategies/trailing-stop.strategy';
import { DCAStrategy } from './strategies/dca.strategy';
import { StrategyProcessor } from './queues/strategy-processor';
import { PrismaModule } from '../prisma/prisma.module';
import { HeliusModule } from '../helius/helius.module';
import { SniperooModule } from '../sniperoo/sniperoo.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'strategy-execution',
    }),
    PrismaModule,
    HeliusModule,
    SniperooModule,
  ],
  providers: [
    TradingService,
    OrderExecutorService,
    PositionManagerService,
    PriceTrackerService,
    AutoBuyNewPoolsStrategy,
    GridSellingStrategy,
    TrailingStopStrategy,
    DCAStrategy,
    StrategyProcessor,
  ],
  exports: [TradingService],
})
export class TradingModule {}
