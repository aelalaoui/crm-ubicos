import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StrategiesService } from './strategies.service';
import { CreateStrategyDto, UpdateStrategyDto } from '../trading/dto/create-strategy.dto';

interface UserPayload {
  id: string;
}

@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategiesController {
  constructor(private strategiesService: StrategiesService) {}

  @Post()
  create(@CurrentUser() user: UserPayload, @Body() createStrategyDto: CreateStrategyDto) {
    return this.strategiesService.create(user.id, createStrategyDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.strategiesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.strategiesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateStrategyDto: UpdateStrategyDto,
  ) {
    return this.strategiesService.update(id, user.id, updateStrategyDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.strategiesService.remove(id, user.id);
  }

  @Post(':id/start')
  start(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.strategiesService.start(id, user.id);
  }

  @Post(':id/stop')
  stop(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.strategiesService.stop(id, user.id);
  }
}