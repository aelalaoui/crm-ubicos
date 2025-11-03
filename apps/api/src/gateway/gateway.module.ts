import { Module } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway';
import { SniperooModule } from '../sniperoo/sniperoo.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SniperooModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class GatewayModule {}
