import { z } from 'zod';

export const createWalletSchema = z.object({
  name: z
    .string()
    .min(1, 'Wallet name is required')
    .max(100, 'Wallet name must be less than 100 characters'),
});

export const importWalletSchema = z.object({
  name: z
    .string()
    .min(1, 'Wallet name is required')
    .max(100, 'Wallet name must be less than 100 characters'),
  privateKey: z
    .string()
    .min(1, 'Private key is required')
    .regex(/^[A-Za-z0-9]+$/, 'Invalid private key format'),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type ImportWalletInput = z.infer<typeof importWalletSchema>;
