export interface StrategyMetrics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalVolume: number;
  realizedPnL: number;
  unrealizedPnL: number;
  winRate: number;
  averageProfit: number;
  largestWin: number;
  largestLoss: number;
  activePositions: number;
  lastExecutionAt: Date;
}

export interface RaydiumPool {
  address: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  liquidity: number;
  volume24h: number;
  priceUsd: number;
  createdAt: Date;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  supply: number;
  holders: number;
  liquidityLocked: number;
  top10Holdings: number;
}

export interface OrderResult {
  signature: string;
  tokenAddress: string;
  amount: number;
  price: number;
  quantity: number;
  fee: number;
  timestamp: Date;
}

export interface StrategyExecution {
  strategyId: string;
  executedAt: Date;
  status: 'success' | 'failed' | 'partial';
  trades: OrderResult[];
  error?: string;
}
