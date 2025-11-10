import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    this.logger.log(`Finding all positions for user ${userId}`);

    try {
      return await this.prisma.position.findMany({
        where: {
          wallet: {
            userId,
          },
        },
        include: {
          wallet: true,
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error finding positions:`, error);
      throw error;
    }
  }

  async findOne(positionId: string, userId: string) {
    this.logger.log(`Finding position ${positionId} for user ${userId}`);

    try {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
        include: {
          wallet: true,
          transactions: true,
        },
      });

      if (!position || position.wallet.userId !== userId) {
        throw new NotFoundException(`Position ${positionId} not found`);
      }

      return position;
    } catch (error) {
      this.logger.error(`Error finding position:`, error);
      throw error;
    }
  }

  async findByWallet(walletId: string, userId: string) {
    this.logger.log(`Finding positions for wallet ${walletId} and user ${userId}`);

    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet || wallet.userId !== userId) {
        throw new NotFoundException(`Wallet ${walletId} not found`);
      }

      return await this.prisma.position.findMany({
        where: { walletId },
        include: {
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error finding positions by wallet:`, error);
      throw error;
    }
  }
}
