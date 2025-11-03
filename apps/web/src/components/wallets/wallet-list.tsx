'use client';

import { Wallet } from '@/lib/types/wallet.types';
import { WalletCard } from './wallet-card';
import { useDeleteWallet } from '@/lib/api/queries';
import { useToast } from '@/components/ui/use-toast';

interface WalletListProps {
  wallets: Wallet[];
  isLoading?: boolean;
}

export function WalletList({ wallets, isLoading }: WalletListProps) {
  const deleteWallet = useDeleteWallet();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      try {
        await deleteWallet.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Wallet deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete wallet',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No wallets yet</p>
        <p className="text-gray-400 text-sm">Create or import a wallet to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {wallets.map((wallet) => (
        <WalletCard
          key={wallet.id}
          wallet={wallet}
          onDelete={handleDelete}
          isDeleting={deleteWallet.isPending}
        />
      ))}
    </div>
  );
}
