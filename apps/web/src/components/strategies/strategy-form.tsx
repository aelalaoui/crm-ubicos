'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoBuyConfig } from './strategy-config/auto-buy-config';
import { GridSellingConfig } from './strategy-config/grid-selling-config';
import { TrailingStopConfig } from './strategy-config/trailing-stop-config';
import { DCAConfig } from './strategy-config/dca-config';

const strategyFormSchema = z.object({
  name: z.string().min(1, 'Strategy name is required'),
  description: z.string().optional(),
  type: z.enum(['AUTO_BUY_NEW_POOLS', 'GRID_SELLING', 'TRAILING_STOP', 'DCA']),
});

type StrategyFormValues = z.infer<typeof strategyFormSchema>;

interface StrategyFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: any;
}

export function StrategyForm({ onSubmit, isLoading, defaultValues }: StrategyFormProps) {
  const [selectedType, setSelectedType] = useState<string>(defaultValues?.type || '');
  const [configData, setConfigData] = useState<any>(defaultValues?.params || {});

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      type: defaultValues?.type || 'AUTO_BUY_NEW_POOLS',
    },
  });

  const handleSubmit = async (values: StrategyFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      config: {
        type: values.type,
        params: configData,
      },
    };

    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Details</CardTitle>
            <CardDescription>Basic information about your trading strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Strategy Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My First Bot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your strategy..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Strategy Type</FormLabel>
                  <Select
                    onValueChange={(value: string) => {
                      field.onChange(value);
                      setSelectedType(value);
                      setConfigData({});
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a strategy type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AUTO_BUY_NEW_POOLS">Auto-Buy New Pools</SelectItem>
                      <SelectItem value="GRID_SELLING">Grid Selling</SelectItem>
                      <SelectItem value="TRAILING_STOP">Trailing Stop-Loss</SelectItem>
                      <SelectItem value="DCA">Dollar Cost Averaging</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {selectedType === 'AUTO_BUY_NEW_POOLS' && (
          <AutoBuyConfig onConfigChange={setConfigData} defaultValues={configData} />
        )}

        {selectedType === 'GRID_SELLING' && (
          <GridSellingConfig onConfigChange={setConfigData} defaultValues={configData} />
        )}

        {selectedType === 'TRAILING_STOP' && (
          <TrailingStopConfig onConfigChange={setConfigData} defaultValues={configData} />
        )}

        {selectedType === 'DCA' && (
          <DCAConfig onConfigChange={setConfigData} defaultValues={configData} />
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creating...' : 'Create Strategy'}
        </Button>
      </form>
    </Form>
  );
}

