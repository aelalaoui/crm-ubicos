import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TradingService } from '../trading/trading.service';
import { CreateStrategyDto, UpdateStrategyDto } from '../trading/dto/create-strategy.dto';

@Injectable()
export class StrategiesService {
  private readonly logger = new Logger(StrategiesService.name);

  constructor(
    private prisma: PrismaService,
    private tradingService: TradingService,
  ) {}

  async create(userId: string, dto: CreateStrategyDto) {
    this.logger.log(`Creating strategy for user ${userId}`);

    try {
      this.validateStrategyConfig(dto.config);

      const strategy = await this.prisma.tradingStrategy.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          config: dto.config,
          isActive: dto.isActive || false,
        },
      });

      return strategy;
    } catch (error) {
      this.logger.error(`Error creating strategy:`, error);
      throw error;
    }
  }

  async findAll(userId: string) {
    this.logger.log(`Finding all strategies for user ${userId}`);

    try {
      return await this.prisma.tradingStrategy.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error finding strategies:`, error);
      throw error;
    }
  }

  async findOne(strategyId: string, userId: string) {
    this.logger.log(`Finding strategy ${strategyId} for user ${userId}`);

    try {
      const strategy = await this.prisma.tradingStrategy.findUnique({
        where: { id: strategyId },
      });

      if (!strategy || strategy.userId !== userId) {
        throw new NotFoundException(`Strategy ${strategyId} not found`);
      }

      return strategy;
    } catch (error) {
      this.logger.error(`Error finding strategy:`, error);
      throw error;
    }
  }

  async update(strategyId: string, userId: string, dto: UpdateStrategyDto) {
    this.logger.log(`Updating strategy ${strategyId} for user ${userId}`);

    try {
      const strategy = await this.findOne(strategyId, userId);

      if (strategy.isActive) {
        throw new BadRequestException(
          'Cannot update an active strategy. Stop it first.',
        );
      }

      if (dto.config) {
        this.validateStrategyConfig(dto.config);
      }

      return await this.prisma.tradingStrategy.update({
        where: { id: strategyId },
        data: {
          name: dto.name,
          description: dto.description,
          config: dto.config,
          isActive: dto.isActive,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating strategy:`, error);
      throw error;
    }
  }

  async remove(strategyId: string, userId: string) {
    this.logger.log(`Deleting strategy ${strategyId} for user ${userId}`);

    try {
      const strategy = await this.findOne(strategyId, userId);

      if (strategy.isActive) {
        throw new BadRequestException(
          'Cannot delete an active strategy. Stop it first.',
        );
      }

      return await this.prisma.tradingStrategy.delete({
        where: { id: strategyId },
      });
    } catch (error) {
      this.logger.error(`Error deleting strategy:`, error);
      throw error;
    }
  }

  async start(strategyId: string, userId: string) {
    this.logger.log(`Starting strategy ${strategyId} for user ${userId}`);

    try {
      const strategy = await this.findOne(strategyId, userId);

      if (strategy.isActive) {
        throw new BadRequestException('Strategy is already active');
      }

      await this.tradingService.startStrategy(strategyId);

      return await this.prisma.tradingStrategy.findUnique({
        where: { id: strategyId },
      });
    } catch (error) {
      this.logger.error(`Error starting strategy:`, error);
      throw error;
    }
  }

  async stop(strategyId: string, userId: string) {
    this.logger.log(`Stopping strategy ${strategyId} for user ${userId}`);

    try {
      const strategy = await this.findOne(strategyId, userId);

      if (!strategy.isActive) {
        throw new BadRequestException('Strategy is not active');
      }

      await this.tradingService.stopStrategy(strategyId);

      return await this.prisma.tradingStrategy.findUnique({
        where: { id: strategyId },
      });
    } catch (error) {
      this.logger.error(`Error stopping strategy:`, error);
      throw error;
    }
  }

  private validateStrategyConfig(config: any): void {
    if (!config.type) {
      throw new BadRequestException('Strategy type is required');
    }

    const validTypes = [
      'AUTO_BUY_NEW_POOLS',
      'GRID_SELLING',
      'TRAILING_STOP',
      'DCA',
    ];
    if (!validTypes.includes(config.type)) {
      throw new BadRequestException(`Invalid strategy type: ${config.type}`);
    }

    if (!config.params) {
      throw new BadRequestException('Strategy params are required');
    }
  }
}
