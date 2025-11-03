'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { importWalletSchema, ImportWalletInput } from '@/lib/schemas/wallet.schema';
import { useImportWallet } from '@/lib/api/queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface ImportWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportWalletDialog({ open, onOpenChange }: ImportWalletDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const importWallet = useImportWallet();
  const { toast } = useToast();

  const form = useForm<ImportWalletInput>({
    resolver: zodResolver(importWalletSchema),
    defaultValues: {
      name: '',
      privateKey: '',
    },
  });

  const onSubmit = async (data: ImportWalletInput) => {
    setIsLoading(true);
    try {
      await importWallet.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'Wallet imported successfully',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import wallet',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Wallet</DialogTitle>
          <DialogDescription>
            Import an existing Solana wallet using its private key
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name</Label>
            <Input
              id="name"
              placeholder="e.g., My Imported Wallet"
              {...form.register('name')}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key</Label>
            <Input
              id="privateKey"
              type="password"
              placeholder="Enter your private key"
              {...form.register('privateKey')}
              disabled={isLoading}
            />
            {form.formState.errors.privateKey && (
              <p className="text-sm text-red-500">{form.formState.errors.privateKey.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Your private key will be encrypted and never stored in plain text
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Importing...' : 'Import Wallet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
