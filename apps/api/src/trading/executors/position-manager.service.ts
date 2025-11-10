import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HeliusService } from '../../helius/helius.service';

interface CreatePositionInput {
  walletId: string;
  tokenAddress: string;
  entryPrice: number;
  quantity: number;
  strategyId?: string;
}

interface UpdatePositionInput {
  quantity?: number;
  currentPrice?: number;
  status?: string;
}

@Injectable()
export class PositionManagerService {
  private readonly logger = new Logger(PositionManagerService.name);
  private priceCache: Map<string, { price: number; timestamp: number }> =
    new Map();
  private readonly priceCacheTTL = 5000;

  constructor(
    private prisma: PrismaService,
    private heliusService: HeliusService,
  ) {}

  async createPosition(input: CreatePositionInput) {
    this.logger.log(`Creating position: ${JSON.stringify(input)}`);

    try {
      const position = await this.prisma.position.create({
        data: {
          walletId: input.walletId,
          tokenAddress: input.tokenAddress,
          entryPrice: input.entryPrice,
          quantity: input.quantity,
          currentPrice: input.entryPrice,
          status: 'OPEN',
        },
      });

      await this.startPriceTracking(position.id, input.tokenAddress);

      return position;
    } catch (error) {
      this.logger.error(`Error creating position:`, error);
      throw error;
    }
  }

  async createOrUpdatePosition(input: CreatePositionInput) {
    this.logger.log(`Creating or updating position: ${JSON.stringify(input)}`);

    try {
      const existingPosition = await this.prisma.position.findFirst({
        where: {
          walletId: input.walletId,
          tokenAddress: input.tokenAddress,
          status: 'OPEN',
        },
      });

      if (existingPosition) {
        const newQuantity = existingPosition.quantity + input.quantity;
        const newEntryPrice =
          (existingPosition.entryPrice * existingPosition.quantity +
            input.entryPrice * input.quantity) /
          newQuantity;

        return await this.prisma.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: newQuantity,
            entryPrice: newEntryPrice,
            currentPrice: input.entryPrice,
          },
        });
      }

      return await this.createPosition(input);
    } catch (error) {
      this.logger.error(`Error creating or updating position:`, error);
      throw error;
    }
  }

  async getPosition(positionId: string) {
    try {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new NotFoundException(`Position ${positionId} not found`);
      }

      return position;
    } catch (error) {
      this.logger.error(`Error getting position:`, error);
      throw error;
    }
  }

  async updatePosition(positionId: string, input: UpdatePositionInput) {
    this.logger.log(
      `Updating position ${positionId}: ${JSON.stringify(input)}`,
    );

    try {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new NotFoundException(`Position ${positionId} not found`);
      }

      const updateData: any = {};

      if (input.quantity !== undefined) {
        updateData.quantity = input.quantity;
        if (input.quantity === 0) {
          updateData.status = 'CLOSED';
        }
      }

      if (input.currentPrice !== undefined) {
        updateData.currentPrice = input.currentPrice;
        updateData.unrealizedPnl =
          (input.currentPrice - position.entryPrice) * position.quantity;
      }

      if (input.status !== undefined) {
        updateData.status = input.status;
      }

      return await this.prisma.position.update({
        where: { id: positionId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Error updating position:`, error);
      throw error;
    }
  }

  async closePosition(positionId: string, exitPrice: number) {
    this.logger.log(`Closing position ${positionId} at price ${exitPrice}`);

    try {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new NotFoundException(`Position ${positionId} not found`);
      }

      const realizedPnl = (exitPrice - position.entryPrice) * position.quantity;

      return await this.prisma.position.update({
        where: { id: positionId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          currentPrice: exitPrice,
          realizedPnl,
          unrealizedPnl: 0,
          quantity: 0,
        },
      });
    } catch (error) {
      this.logger.error(`Error closing position:`, error);
      throw error;
    }
  }

  async getCurrentPrice(tokenAddress: string): Promise<number> {
    try {
      const cached = this.priceCache.get(tokenAddress);
      if (cached && Date.now() - cached.timestamp < this.priceCacheTTL) {
        return cached.price;
      }

      const price = await this.heliusService.getTokenPrice(tokenAddress);
      this.priceCache.set(tokenAddress, {
        price,
        timestamp: Date.now(),
      });

      return price;
    } catch (error) {
      this.logger.error(`Error getting current price for ${tokenAddress}:`, error);
      return 0;
    }
  }

  private async startPriceTracking(
    positionId: string,
    tokenAddress: string,
  ): Promise<void> {
    const checkInterval = 10000;

    const updatePrice = async () => {
      try {
        const currentPrice = await this.getCurrentPrice(tokenAddress);
        await this.updatePosition(positionId, { currentPrice });
      } catch (error) {
        this.logger.error(`Error updating price for position ${positionId}:`, error);
      }

      setTimeout(updatePrice, checkInterval);
    };

    updatePrice();
  }
}
