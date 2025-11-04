export interface SniperooWalletDTO {
  id: string;
  publicKey: string;
  balance: number;
  createdAt?: string;
}

export interface SniperooPositionDTO {
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

export interface SniperooOrderDTO {
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

export type WebSocketEventType =
  | 'position:created'
  | 'position:updated'
  | 'position:closed'
  | 'order:executed'
  | 'order:failed';

export interface WebSocketEventDTO {
  type: WebSocketEventType;
  data: SniperooPositionDTO | SniperooOrderDTO;
  timestamp: string;
}
