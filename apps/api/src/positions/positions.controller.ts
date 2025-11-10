import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PositionsService } from './positions.service';

interface UserPayload {
  id: string;
}

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.positionsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.positionsService.findOne(id, user.id);
  }

  @Get('wallet/:walletId')
  findByWallet(@CurrentUser() user: UserPayload, @Param('walletId') walletId: string) {
    return this.positionsService.findByWallet(walletId, user.id);
  }
}
