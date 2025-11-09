import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { PrismaService } from '../prisma/prisma.service';
import { SniperooService } from '../sniperoo/sniperoo.service';

describe('WalletsService', () => {
  let service: WalletsService;
  let prismaService: PrismaService;
  let sniperooService: SniperooService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: SniperooService,
          useValue: {
            createWallet: jest.fn(),
            importWallet: jest.fn(),
            deleteWallet: jest.fn(),
            getWalletBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    prismaService = module.get<PrismaService>(PrismaService);
    sniperooService = module.get<SniperooService>(SniperooService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a wallet with encryption', async () => {
      const mockSniperooWallet = {
        wallet: {
          id: 'sniperoo-123',
          publicKey: 'public-key',
          balance: 0,
        },
        privateKey: 'private-key',
      };

      const mockDbWallet = {
        id: 'wallet-123',
        userId: 'user-123',
        name: 'Test Wallet',
        publicKey: 'public-key',
        encryptedPrivateKey: 'encrypted-key',
        balance: 0,
        isActive: true,
        sniperooWalletId: 'sniperoo-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(sniperooService, 'createWallet').mockResolvedValueOnce(mockSniperooWallet);
      jest.spyOn(prismaService.wallet, 'create').mockResolvedValueOnce(mockDbWallet);

      const result = await service.create('user-123', { name: 'Test Wallet' });

      expect(result).toEqual(mockDbWallet);
      expect(sniperooService.createWallet).toHaveBeenCalledWith('Test Wallet');
      expect(prismaService.wallet.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all user wallets', async () => {
      const mockWallets = [
        {
          id: 'wallet-1',
          userId: 'user-123',
          name: 'Wallet 1',
          publicKey: 'key-1',
          encryptedPrivateKey: 'encrypted-key-1',
          balance: 1.0,
          isActive: true,
          sniperooWalletId: 'sniperoo-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prismaService.wallet, 'findMany').mockResolvedValueOnce(mockWallets);

      const result = await service.findAll('user-123');

      expect(result).toEqual(mockWallets);
      expect(prismaService.wallet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isActive: true },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getBalance', () => {
    it('should get wallet balance from Sniperoo', async () => {
      const mockWallet = {
        id: 'wallet-123',
        userId: 'user-123',
        name: 'Wallet',
        publicKey: 'public-key',
        encryptedPrivateKey: 'encrypted-key',
        sniperooWalletId: 'sniperoo-123',
        balance: 1.0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.wallet, 'findFirst').mockResolvedValueOnce(mockWallet);
      jest.spyOn(sniperooService, 'getWalletBalance').mockResolvedValueOnce(2.5);
      jest.spyOn(prismaService.wallet, 'update').mockResolvedValueOnce({
        ...mockWallet,
        balance: 2.5,
      });

      const result = await service.getBalance('wallet-123', 'user-123');

      expect(result.balance).toBe(2.5);
      expect(sniperooService.getWalletBalance).toHaveBeenCalledWith('sniperoo-123');
    });
  });

  describe('delete', () => {
    it('should delete wallet and call Sniperoo', async () => {
      const mockWallet = {
        id: 'wallet-123',
        userId: 'user-123',
        name: 'Wallet',
        publicKey: 'public-key',
        encryptedPrivateKey: 'encrypted-key',
        sniperooWalletId: 'sniperoo-123',
        balance: 1.0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.wallet, 'findFirst').mockResolvedValueOnce(mockWallet);
      jest.spyOn(sniperooService, 'deleteWallet').mockResolvedValueOnce(undefined);
      jest.spyOn(prismaService.wallet, 'update').mockResolvedValueOnce({
        ...mockWallet,
        isActive: false,
      });

      const result = await service.delete('wallet-123', 'user-123');

      expect(result.message).toBe('Wallet deleted successfully');
      expect(sniperooService.deleteWallet).toHaveBeenCalledWith('sniperoo-123');
    });
  });
});
