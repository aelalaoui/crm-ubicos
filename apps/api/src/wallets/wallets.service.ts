import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWalletDto: CreateWalletDto) {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        name: createWalletDto.name,
        publicKey: 'PLACEHOLDER_PUBLIC_KEY',
        encryptedPrivateKey: 'PLACEHOLDER_ENCRYPTED_PRIVATE_KEY',
      },
      select: {
        id: true,
        name: true,
        publicKey: true,
        balance: true,
        isActive: true,
        createdAt: true,
      },
    });

    return wallet;
  }

  async import(userId: string, importWalletDto: ImportWalletDto) {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        name: importWalletDto.name,
        publicKey: 'PLACEHOLDER_PUBLIC_KEY',
        encryptedPrivateKey: 'PLACEHOLDER_ENCRYPTED_PRIVATE_KEY',
      },
      select: {
        id: true,
        name: true,
        publicKey: true,
        balance: true,
        isActive: true,
        createdAt: true,
      },
    });

    return wallet;
  }

  async findAll(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        publicKey: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
      include: {
        positions: {
          where: { status: 'OPEN' },
          select: {
            id: true,
            tokenAddress: true,
            tokenSymbol: true,
            entryPrice: true,
            currentPrice: true,
            quantity: true,
            unrealizedPnl: true,
            openedAt: true,
          },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            tokenAddress: true,
            amount: true,
            price: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async remove(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.prisma.wallet.delete({ where: { id } });

    return { message: 'Wallet deleted successfully' };
  }
}
