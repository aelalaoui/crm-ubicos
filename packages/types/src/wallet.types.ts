export interface WalletDTO {
  id: string;
  name: string;
  publicKey: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletDTO {
  name: string;
}

export interface ImportWalletDTO {
  name: string;
  privateKey: string;
}

export interface WalletBalanceDTO {
  balance: number;
}

export interface WalletListDTO {
  wallets: WalletDTO[];
  total: number;
}
