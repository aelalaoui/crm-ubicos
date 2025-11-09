'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddWallet = async () => {
    if (!walletName.trim()) {
      setError('Wallet name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accessToken = useAuthStore.getState().accessToken; // Get token from auth store

      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: walletName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create wallet');
      }

      const newWallet = await response.json();

      // Add the new wallet to the list
      setWallets([
        ...wallets,
        {
          id: newWallet.id,
          name: newWallet.name,
          address: newWallet.publicKey,
          balance: newWallet.balance,
          currency: 'SOL',
        },
      ]);

      // Reset form and close dialog
      setWalletName('');
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the wallet');
      console.error('Error creating wallet:', err);
    } finally {
      setIsLoading(false);
    }
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>Create a new Solana wallet for your trading</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Wallet Name</label>
                <Input
                  placeholder="e.g., My Trading Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleAddWallet} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Wallet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {wallets.length === 0 ? (
        <Card className="text-center p-12">
          <CardHeader>
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Wallets Connected</CardTitle>
            <CardDescription>Create your first wallet to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Wallet</DialogTitle>
                  <DialogDescription>Create a new Solana wallet for your trading</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Wallet Name</label>
                    <Input
                      placeholder="e.g., My Trading Wallet"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {error && <div className="text-sm text-red-500">{error}</div>}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddWallet} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Wallet'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
