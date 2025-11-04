'use client';

import { useParams } from 'next/navigation';
import { useWallet, useWalletBalance } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function WalletDetailPage() {
  const params = useParams();
  const walletId = params.id as string;
  const { data: wallet, isLoading: walletLoading } = useWallet(walletId);
  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance(walletId);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard',
    });
  };

  if (walletLoading) {
    return <div className="text-center py-12">Loading wallet...</div>;
  }

  if (!wallet) {
    return <div className="text-center py-12">Wallet not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/wallets">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wallets
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{wallet.name}</h1>
        <p className="text-gray-500 mt-1">Wallet Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Public Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 break-all">
                {wallet.publicKey}
              </code>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(wallet.publicKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {balanceLoading
                ? 'Loading...'
                : `${(balanceData?.balance || wallet.balance).toFixed(4)} SOL`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm">{new Date(wallet.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-sm">{wallet.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button>Buy Token</Button>
            <Button variant="outline">Sell Token</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
