'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TrailingStopConfigProps {
  onConfigChange: (config: any) => void;
  defaultValues?: any;
}

export function TrailingStopConfig({ onConfigChange, defaultValues }: TrailingStopConfigProps) {
  const [positionId, setPositionId] = useState(defaultValues?.positionId || '');
  const [trailPercent, setTrailPercent] = useState(defaultValues?.trailPercent || 10);
  const [activationMultiplier, setActivationMultiplier] = useState(
    defaultValues?.activationMultiplier || 1.5,
  );

  const handleChange = () => {
    onConfigChange({
      positionId,
      trailPercent,
      activationMultiplier,
    });
  };

  const updateField = (setter: any, value: any) => {
    setter(value);
    setTimeout(handleChange, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trailing Stop-Loss Configuration</CardTitle>
        <CardDescription>
          Automatically sell when price drops below a trailing threshold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="positionId">Position ID</Label>
          <Input
            id="positionId"
            placeholder="Enter position ID to protect"
            value={positionId}
            onChange={(e) => updateField(setPositionId, e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trailPercent">Trail Percent (%)</Label>
            <Input
              id="trailPercent"
              type="number"
              step="0.1"
              min="0"
              value={trailPercent}
              onChange={(e) => updateField(setTrailPercent, parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Stop loss will be {trailPercent}% below ATH
            </p>
          </div>

          <div>
            <Label htmlFor="activationMultiplier">Activation Multiplier</Label>
            <Input
              id="activationMultiplier"
              type="number"
              step="0.1"
              min="1"
              value={activationMultiplier}
              onChange={(e) =>
                updateField(setActivationMultiplier, parseFloat(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Activates after {activationMultiplier}x entry price
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
