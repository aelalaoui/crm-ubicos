'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Play, Pause, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StrategyCardProps {
  strategy: {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    config: {
      type: string;
      params?: any;
    };
  };
  metrics?: {
    totalTrades: number;
    winRate: number;
    realizedPnL: number;
  };
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const strategyIcons: Record<string, string> = {
  AUTO_BUY_NEW_POOLS: '🤖',
  GRID_SELLING: '📊',
  TRAILING_STOP: '🛑',
  DCA: '📈',
};

export function StrategyCard({
  strategy,
  metrics,
  onStart,
  onStop,
  onDelete,
  onEdit,
}: StrategyCardProps) {
  const icon = strategyIcons[strategy.config.type] || '⚙️';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <CardTitle className="text-lg">{strategy.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {strategy.config.type.replace(/_/g, ' ')}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!strategy.isActive && onStart && (
                <DropdownMenuItem onClick={() => onStart(strategy.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </DropdownMenuItem>
              )}
              {strategy.isActive && onStop && (
                <DropdownMenuItem onClick={() => onStop(strategy.id)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(strategy.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(strategy.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={strategy.isActive ? 'default' : 'secondary'}>
              {strategy.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {metrics && (
            <>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Trades</p>
                  <p className="text-sm font-semibold">{metrics.totalTrades}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-sm font-semibold">{metrics.winRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">P&L</p>
                  <p
                    className={`text-sm font-semibold ${
                      metrics.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metrics.realizedPnL.toFixed(2)} SOL
                  </p>
                </div>
              </div>
            </>
          )}

          {strategy.description && (
            <p className="text-xs text-muted-foreground pt-2">{strategy.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
