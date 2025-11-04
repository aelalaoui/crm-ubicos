'use client';

import { Wallet } from '@/lib/types/wallet.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface WalletCardProps {
  wallet: Wallet;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function WalletCard({ wallet, onDelete, isDeleting }: WalletCardProps) {
  const { toast } = useToast();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{wallet.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Public Key</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {truncateAddress(wallet.publicKey)}
            </code>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(wallet.publicKey)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold mt-1">{wallet.balance.toFixed(4)} SOL</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/wallets/${wallet.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(wallet.id)}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
