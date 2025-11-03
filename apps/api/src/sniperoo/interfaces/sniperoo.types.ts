export interface SniperooWallet {
  id: string;
  publicKey: string;
  balance: number;
  createdAt?: string;
}

export interface SniperooCreateWalletResponse {
  wallet: SniperooWallet;
  privateKey: string;
}

export interface SniperooPosition {
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

export interface SniperooOrder {
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

export interface SniperooTradeParams {
  walletId: string;
  tokenAddress: string;
  amount: number;
  slippage?: number;
}

export interface SniperooTradeResponse {
  signature: string;
  status: 'success' | 'failed';
  message?: string;
  orderId?: string;
}

export interface SniperooListWalletsResponse {
  wallets: SniperooWallet[];
  total: number;
}

export interface SniperooListPositionsResponse {
  positions: SniperooPosition[];
  total: number;
}

export interface SniperooListOrdersResponse {
  orders: SniperooOrder[];
  total: number;
}

export interface SniperooWebSocketEvent {
  type: 'position:created' | 'position:updated' | 'position:closed' | 'order:executed' | 'order:failed';
  data: SniperooPosition | SniperooOrder;
  timestamp: string;
}

export interface SniperooErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
