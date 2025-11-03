import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SniperooService } from '../sniperoo/sniperoo.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import * as crypto from 'crypto';

@Injectable()
export class WalletsService {
  constructor(
    private prisma: PrismaService,
    private sniperooService: SniperooService,
  ) {}

  private encryptPrivateKey(privateKey: string, password: string): string {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    const combined = salt.toString('hex') + ':' + iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

    return combined;
  }

  private decryptPrivateKey(encryptedData: string, password: string): string {
    const parts = encryptedData.split(':');
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async create(userId: string, createWalletDto: CreateWalletDto, userPassword: string) {
    const sniperooWallet = await this.sniperooService.createWallet(createWalletDto.name);

    const encryptedKey = this.encryptPrivateKey(sniperooWallet.privateKey, userPassword);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        sniperooWalletId: sniperooWallet.wallet.id,
        name: createWalletDto.name,
        publicKey: sniperooWallet.wallet.publicKey,
        encryptedPrivateKey: encryptedKey,
        balance: sniperooWallet.wallet.balance || 0,
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

  async import(userId: string, importWalletDto: ImportWalletDto, userPassword: string) {
    const sniperooWallet = await this.sniperooService.importWallet(
      importWalletDto.name,
      importWalletDto.privateKey,
    );

    const encryptedKey = this.encryptPrivateKey(importWalletDto.privateKey, userPassword);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        sniperooWalletId: sniperooWallet.id,
        name: importWalletDto.name,
        publicKey: sniperooWallet.publicKey,
        encryptedPrivateKey: encryptedKey,
        balance: sniperooWallet.balance || 0,
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
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        publicKey: true,
        balance: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return wallets;
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        publicKey: true,
        balance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async delete(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.sniperooWalletId) {
      await this.sniperooService.deleteWallet(wallet.sniperooWalletId);
    }

    await this.prisma.wallet.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Wallet deleted successfully' };
  }

  async getBalance(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (!wallet.sniperooWalletId) {
      return { balance: wallet.balance };
    }

    const balance = await this.sniperooService.getWalletBalance(wallet.sniperooWalletId);

    await this.prisma.wallet.update({
      where: { id },
      data: { balance },
    });

    return { balance };
  }

  async syncBalance(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || !wallet.sniperooWalletId) {
      throw new NotFoundException('Wallet not found');
    }

    const balance = await this.sniperooService.getWalletBalance(wallet.sniperooWalletId);

    await this.prisma.wallet.update({
      where: { id },
      data: { balance },
    });

    return { balance };
  }
}
