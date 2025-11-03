import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletAPI } from './wallets';
import { Wallet, CreateWalletInput, ImportWalletInput } from '../types/wallet.types';

export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletAPI.fetchWallets(),
    staleTime: 30000,
  });
};

export const useWallet = (id: string) => {
  return useQuery({
    queryKey: ['wallet', id],
    queryFn: () => walletAPI.getWallet(id),
    staleTime: 30000,
    enabled: !!id,
  });
};

export const useWalletBalance = (id: string) => {
  return useQuery({
    queryKey: ['wallet-balance', id],
    queryFn: () => walletAPI.getWalletBalance(id),
    staleTime: 10000,
    enabled: !!id,
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWalletInput) => walletAPI.createWallet(data),
    onSuccess: (newWallet) => {
      queryClient.setQueryData(['wallets'], (old: Wallet[] | undefined) => {
        return old ? [newWallet, ...old] : [newWallet];
      });
    },
  });
};

export const useImportWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportWalletInput) => walletAPI.importWallet(data),
    onSuccess: (newWallet) => {
      queryClient.setQueryData(['wallets'], (old: Wallet[] | undefined) => {
        return old ? [newWallet, ...old] : [newWallet];
      });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => walletAPI.deleteWallet(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['wallets'], (old: Wallet[] | undefined) => {
        return old ? old.filter((w) => w.id !== id) : [];
      });
      queryClient.invalidateQueries({ queryKey: ['wallet', id] });
    },
  });
};
