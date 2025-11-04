import { Test, TestingModule } from '@nestjs/testing';
import { SniperooService } from './sniperoo.service';
import { ConfigService } from '@nestjs/config';

describe('SniperooService', () => {
  let service: SniperooService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SniperooService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SNIPEROO_API_URL: 'https://api.sniperoo.app',
                SNIPEROO_API_KEY: 'test-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SniperooService>(SniperooService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a wallet', async () => {
      const mockResponse = {
        wallet: {
          id: 'wallet-123',
          publicKey: 'public-key-123',
          balance: 0,
        },
        privateKey: 'private-key-123',
      };

      jest.spyOn(service['client'], 'post').mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.createWallet('Test Wallet');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('importWallet', () => {
    it('should import a wallet', async () => {
      const mockResponse = {
        id: 'wallet-456',
        publicKey: 'public-key-456',
        balance: 1.5,
      };

      jest.spyOn(service['client'], 'post').mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.importWallet('Imported Wallet', 'private-key');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getWalletBalance', () => {
    it('should get wallet balance', async () => {
      const mockResponse = { balance: 2.5 };

      jest.spyOn(service['client'], 'get').mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.getWalletBalance('wallet-123');

      expect(result).toBe(2.5);
    });
  });

  describe('retry logic', () => {
    it('should retry on failure', async () => {
      const mockError = new Error('Network error');
      const mockSuccess = { data: { balance: 1.0 } };

      const spy = jest.spyOn(service['client'], 'get');
      spy.mockRejectedValueOnce(mockError);
      spy.mockRejectedValueOnce(mockError);
      spy.mockResolvedValueOnce(mockSuccess);

      const result = await service.getWalletBalance('wallet-123');

      expect(result).toBe(1.0);
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });
});
