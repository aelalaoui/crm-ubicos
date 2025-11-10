'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StrategyCard } from '@/components/strategies/strategy-card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface Strategy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  config: {
    type: string;
  };
}

export default function StrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategies', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (strategyId: string) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchStrategies();
      }
    } catch (error) {
      console.error('Error starting strategy:', error);
    }
  };

  const handleStop = async (strategyId: string) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/stop`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchStrategies();
      }
    } catch (error) {
      console.error('Error stopping strategy:', error);
    }
  };

  const handleDelete = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchStrategies();
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  };

  const handleEdit = (strategyId: string) => {
    router.push(`/strategies/${strategyId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Strategies</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your automated trading strategies
          </p>
        </div>
        <Link href="/strategies/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Strategy
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading strategies...</p>
        </div>
      ) : strategies.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No strategies yet</p>
          <Link href="/strategies/create">
            <Button>Create Your First Strategy</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
