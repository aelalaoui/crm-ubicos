import { Module } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { StrategiesController } from './strategies.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TradingModule } from '../trading/trading.module';

@Module({
  imports: [PrismaModule, TradingModule],
  controllers: [StrategiesController],
  providers: [StrategiesService],
})
export class StrategiesModule {}
