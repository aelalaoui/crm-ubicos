'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StrategyForm } from '@/components/strategies/strategy-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateStrategyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create strategy');
      }

      const strategy = await response.json();
      router.push(`/strategies/${strategy.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Strategy</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new automated trading strategy
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <StrategyForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
