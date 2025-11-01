export interface SniperooWallet {
  id: string;
  publicKey: string;
  balance: number;
}

export interface SniperooCreateWalletResponse {
  wallet: SniperooWallet;
  privateKey: string;
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
}
