'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallets } from '@/lib/api/queries';
import { WalletList } from '@/components/wallets/wallet-list';
import { CreateWalletDialog } from '@/components/wallets/create-wallet-dialog';
import { ImportWalletDialog } from '@/components/wallets/import-wallet-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Download, TrendingUp } from 'lucide-react';

export default function WalletsPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { data: wallets = [], isLoading, error } = useWallets();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-gray-500 mt-1">Manage your Solana wallets</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading wallets. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-gray-500 mt-1">Manage your Solana wallets</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/strategies')} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Strategies
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Import Wallet
          </Button>
        </div>
      </div>

      <WalletList wallets={Array.isArray(wallets) ? wallets : []} isLoading={isLoading} />

      <CreateWalletDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ImportWalletDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  );
}
