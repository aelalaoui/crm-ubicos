'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AutoBuyConfigProps {
  onConfigChange: (config: any) => void;
  defaultValues?: any;
}

export function AutoBuyConfig({ onConfigChange, defaultValues }: AutoBuyConfigProps) {
  const [walletId, setWalletId] = useState(defaultValues?.walletId || '');
  const [minLiquidity, setMinLiquidity] = useState(defaultValues?.minLiquidity || 10000);
  const [maxLiquidity, setMaxLiquidity] = useState(defaultValues?.maxLiquidity || 500000);
  const [buyAmount, setBuyAmount] = useState(defaultValues?.buyAmount || 0.01);
  const [slippage, setSlippage] = useState(defaultValues?.slippage || 2);
  const [rugCheckEnabled, setRugCheckEnabled] = useState(
    defaultValues?.rugCheckEnabled !== false,
  );
  const [minLiquidityLocked, setMinLiquidityLocked] = useState(
    defaultValues?.minLiquidityLocked || 80,
  );
  const [maxTop10Holdings, setMaxTop10Holdings] = useState(
    defaultValues?.maxTop10Holdings || 30,
  );

  const handleChange = () => {
    onConfigChange({
      walletId,
      minLiquidity,
      maxLiquidity,
      buyAmount,
      slippage,
      rugCheckEnabled,
      minLiquidityLocked,
      maxTop10Holdings,
    });
  };

  const updateField = (setter: any, value: any) => {
    setter(value);
    setTimeout(handleChange, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Buy New Pools Configuration</CardTitle>
        <CardDescription>Configure automatic buying of new Raydium pools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="walletId">Wallet ID</Label>
          <Input
            id="walletId"
            placeholder="Select wallet to use for buying"
            value={walletId}
            onChange={(e) => updateField(setWalletId, e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minLiquidity">Min Liquidity (USD)</Label>
            <Input
              id="minLiquidity"
              type="number"
              value={minLiquidity}
              onChange={(e) => updateField(setMinLiquidity, parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="maxLiquidity">Max Liquidity (USD)</Label>
            <Input
              id="maxLiquidity"
              type="number"
              value={maxLiquidity}
              onChange={(e) => updateField(setMaxLiquidity, parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyAmount">Buy Amount (SOL)</Label>
            <Input
              id="buyAmount"
              type="number"
              step="0.001"
              value={buyAmount}
              onChange={(e) => updateField(setBuyAmount, parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="slippage">Slippage (%)</Label>
            <Input
              id="slippage"
              type="number"
              step="0.1"
              value={slippage}
              onChange={(e) => updateField(setSlippage, parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="rugCheck"
              checked={rugCheckEnabled}
              onChange={(e) => updateField(setRugCheckEnabled, e.target.checked)}
            />
            <Label htmlFor="rugCheck" className="cursor-pointer">
              Enable Rug Check
            </Label>
          </div>

          {rugCheckEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <Label htmlFor="minLiquidityLocked">Min Liquidity Locked (%)</Label>
                <Input
                  id="minLiquidityLocked"
                  type="number"
                  value={minLiquidityLocked}
                  onChange={(e) =>
                    updateField(setMinLiquidityLocked, parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxTop10Holdings">Max Top 10 Holdings (%)</Label>
                <Input
                  id="maxTop10Holdings"
                  type="number"
                  value={maxTop10Holdings}
                  onChange={(e) => updateField(setMaxTop10Holdings, parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
