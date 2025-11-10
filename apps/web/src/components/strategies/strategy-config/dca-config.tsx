'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DCAConfigProps {
  onConfigChange: (config: any) => void;
  defaultValues?: any;
}

export function DCAConfig({ onConfigChange, defaultValues }: DCAConfigProps) {
  const [walletId, setWalletId] = useState(defaultValues?.walletId || '');
  const [tokenAddress, setTokenAddress] = useState(defaultValues?.tokenAddress || '');
  const [buyAmount, setBuyAmount] = useState(defaultValues?.buyAmount || 0.01);
  const [intervalHours, setIntervalHours] = useState(defaultValues?.intervalHours || 24);
  const [totalBuys, setTotalBuys] = useState(defaultValues?.totalBuys || 10);

  const handleChange = () => {
    onConfigChange({
      walletId,
      tokenAddress,
      buyAmount,
      intervalHours,
      totalBuys,
    });
  };

  const updateField = (setter: any, value: any) => {
    setter(value);
    setTimeout(handleChange, 0);
  };

  const totalInvestment = (buyAmount * totalBuys).toFixed(3);
  const estimatedDuration = (intervalHours * totalBuys) / 24;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dollar Cost Averaging (DCA) Configuration</CardTitle>
        <CardDescription>Buy a fixed amount at regular intervals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="walletId">Wallet ID</Label>
          <Input
            id="walletId"
            placeholder="Select wallet for DCA purchases"
            value={walletId}
            onChange={(e) => updateField(setWalletId, e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tokenAddress">Token Address</Label>
          <Input
            id="tokenAddress"
            placeholder="Token contract address"
            value={tokenAddress}
            onChange={(e) => updateField(setTokenAddress, e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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
            <Label htmlFor="intervalHours">Interval (Hours)</Label>
            <Input
              id="intervalHours"
              type="number"
              step="1"
              min="1"
              value={intervalHours}
              onChange={(e) => updateField(setIntervalHours, parseFloat(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="totalBuys">Total Buys</Label>
            <Input
              id="totalBuys"
              type="number"
              step="1"
              min="1"
              value={totalBuys}
              onChange={(e) => updateField(setTotalBuys, parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-muted p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Investment:</span>
            <span className="font-semibold">{totalInvestment} SOL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Duration:</span>
            <span className="font-semibold">{estimatedDuration.toFixed(1)} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frequency:</span>
            <span className="font-semibold">Every {intervalHours} hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
