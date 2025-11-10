'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Strategy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  config: any;
  createdAt: string;
  updatedAt: string;
}

interface StrategyMetrics {
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
  lastExecutionAt: string;
}

export default function StrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [metrics, setMetrics] = useState<StrategyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStrategy();
  }, [strategyId]);

  const fetchStrategy = async () => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStrategy(data);
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error fetching strategy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/metrics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!strategy) {
    return <div className="text-center py-12">Strategy not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{strategy.name}</h1>
          {strategy.description && (
            <p className="text-muted-foreground mt-1">{strategy.description}</p>
          )}
        </div>
        <Badge variant={strategy.isActive ? 'default' : 'secondary'}>
          {strategy.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{strategy.config.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    {strategy.isActive ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">
                    {new Date(strategy.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(strategy.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Strategy parameters and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(strategy.config.params, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {metrics ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.totalTrades}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Realized P&L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
                        metrics.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metrics.realizedPnL.toFixed(2)} SOL
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
                        metrics.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metrics.unrealizedPnL.toFixed(2)} SOL
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.activePositions}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.totalVolume.toFixed(2)} SOL</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successful Trades</span>
                    <span className="font-semibold">{metrics.successfulTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed Trades</span>
                    <span className="font-semibold">{metrics.failedTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Profit</span>
                    <span className="font-semibold">{metrics.averageProfit.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Largest Win</span>
                    <span className="font-semibold text-green-600">
                      {metrics.largestWin.toFixed(4)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Largest Loss</span>
                    <span className="font-semibold text-red-600">
                      {metrics.largestLoss.toFixed(4)} SOL
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No performance data available yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
