'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface WalletItem {
  id: string;
  name: string;
  address: string;
  balance: number;
  currency: string;
}

export default function WalletsPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const handleAddWallet = () => {
    // TODO: Implement wallet connection dialog
    console.log('Add wallet');
  };

  const handleDeleteWallet = (id: string) => {
    setWallets(wallets.filter((w) => w.id !== id));
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">Manage your connected wallets</p>
        </div>
        <Button onClick={handleAddWallet} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Connect Wallet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <Card className="text-center p-12">
          <CardHeader>
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Wallets Connected</CardTitle>
            <CardDescription>Connect your first wallet to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAddWallet} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Connect Your First Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>{wallet.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{wallet.address}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyAddress(wallet.address)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWallet(wallet.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">
                      {wallet.balance} {wallet.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
