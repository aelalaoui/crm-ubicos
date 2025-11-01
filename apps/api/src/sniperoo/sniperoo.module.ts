import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SniperooService } from './sniperoo.service';

@Module({
  imports: [ConfigModule],
  providers: [SniperooService],
  exports: [SniperooService],
})
export class SniperooModule {}
