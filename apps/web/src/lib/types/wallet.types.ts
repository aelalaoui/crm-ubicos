export interface Wallet {
  id: string;
  name: string;
  publicKey: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWalletInput {
  name: string;
}

export interface ImportWalletInput {
  name: string;
  privateKey: string;
}

export interface WalletBalance {
  balance: number;
}

export interface WalletResponse {
  id: string;
  name: string;
  publicKey: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Position {
  id: string;
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  status: 'OPEN' | 'CLOSED' | 'PARTIAL';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  walletId: string;
  type: 'BUY' | 'SELL';
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  signature?: string;
  createdAt: string;
  executedAt?: string;
}
