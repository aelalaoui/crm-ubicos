'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface GridSellingConfigProps {
  onConfigChange: (config: any) => void;
  defaultValues?: any;
}

interface GridTarget {
  priceMultiplier: number;
  sellPercent: number;
}

export function GridSellingConfig({ onConfigChange, defaultValues }: GridSellingConfigProps) {
  const [positionId, setPositionId] = useState(defaultValues?.positionId || '');
  const [targets, setTargets] = useState<GridTarget[]>(
    defaultValues?.targets || [
      { priceMultiplier: 2, sellPercent: 25 },
      { priceMultiplier: 3, sellPercent: 25 },
      { priceMultiplier: 5, sellPercent: 50 },
    ],
  );

  const handleAddTarget = () => {
    const newTargets = [...targets, { priceMultiplier: 2, sellPercent: 25 }];
    setTargets(newTargets);
    onConfigChange({ positionId, targets: newTargets });
  };

  const handleRemoveTarget = (index: number) => {
    const newTargets = targets.filter((_, i) => i !== index);
    setTargets(newTargets);
    onConfigChange({ positionId, targets: newTargets });
  };

  const handleTargetChange = (index: number, field: string, value: number) => {
    const newTargets = [...targets];
    newTargets[index] = { ...newTargets[index], [field]: value };
    setTargets(newTargets);
    onConfigChange({ positionId, targets: newTargets });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Selling Configuration</CardTitle>
        <CardDescription>Define price levels to sell portions of your position</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="positionId">Position ID (Optional)</Label>
          <Input
            id="positionId"
            placeholder="Leave empty to link to new position"
            value={positionId}
            onChange={(e) => {
              setPositionId(e.target.value);
              onConfigChange({ positionId: e.target.value, targets });
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Sell Targets</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTarget}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Target
            </Button>
          </div>

          {targets.map((target, index) => (
            <div key={index} className="flex gap-2 items-end p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <Label className="text-xs">Price Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  value={target.priceMultiplier}
                  onChange={(e) =>
                    handleTargetChange(index, 'priceMultiplier', parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Sell %</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={target.sellPercent}
                  onChange={(e) =>
                    handleTargetChange(index, 'sellPercent', parseFloat(e.target.value))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTarget(index)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
