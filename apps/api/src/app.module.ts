import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { SniperooModule } from './sniperoo/sniperoo.module';
import { GatewayModule } from './gateway/gateway.module';
import { HealthModule } from './common/health/health.module';
import { TradingModule } from './trading/trading.module';
import { StrategiesModule } from './strategies/strategies.module';
import { PositionsModule } from './positions/positions.module';
import { HeliusModule } from './helius/helius.module';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    SniperooModule,
    GatewayModule,
    HealthModule,
    TradingModule,
    StrategiesModule,
    PositionsModule,
    HeliusModule,
  ],
})
export class AppModule {}