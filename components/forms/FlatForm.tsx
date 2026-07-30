'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const flatSchema = z.object({
  flatNumber: z.string().min(1, 'Flat number is required'),
});

export type FlatFormData = z.infer<typeof flatSchema>;

interface FlatFormProps {
  initialData?: Partial<FlatFormData>;
  onSubmit: (data: FlatFormData) => Promise<void>;
  isLoading?: boolean;
}

export const FlatForm: React.FC<FlatFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FlatFormData>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      flatNumber: initialData?.flatNumber || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Flat Number"
        placeholder="e.g. A101, B202, 503"
        error={errors.flatNumber?.message}
        {...register('flatNumber')}
      />

      <div className="pt-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Flat' : 'Add Flat'}
        </Button>
      </div>
    </form>
  );
};
