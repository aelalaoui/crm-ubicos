import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class ExecuteTradeDto {
  @IsString()
  walletId: string;

  @IsString()
  tokenAddress: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  slippage: number;

  @IsOptional()
  @IsString()
  strategyId?: string;
}

export class GridSellingTarget {
  @IsNumber()
  priceMultiplier: number;

  @IsNumber()
  sellPercent: number;
}

export class AutoBuyConfig {
  @IsString()
  type: 'AUTO_BUY_NEW_POOLS';

  @IsString()
  walletId: string;

  @IsNumber()
  minLiquidity: number;

  @IsNumber()
  maxLiquidity: number;

  @IsNumber()
  buyAmount: number;

  @IsNumber()
  slippage: number;

  @IsBoolean()
  rugCheckEnabled: boolean;

  @IsNumber()
  minLiquidityLocked: number;

  @IsNumber()
  maxTop10Holdings: number;
}

export class GridSellingConfig {
  @IsString()
  type: 'GRID_SELLING';

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsArray()
  targets: GridSellingTarget[];
}

export class TrailingStopConfig {
  @IsString()
  type: 'TRAILING_STOP';

  @IsString()
  positionId: string;

  @IsNumber()
  trailPercent: number;

  @IsOptional()
  @IsNumber()
  activationMultiplier?: number;
}

export class DCAConfig {
  @IsString()
  type: 'DCA';

  @IsString()
  walletId: string;

  @IsString()
  tokenAddress: string;

  @IsNumber()
  buyAmount: number;

  @IsNumber()
  intervalHours: number;

  @IsNumber()
  totalBuys: number;
}
