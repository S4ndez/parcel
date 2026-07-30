'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const apartmentSchema = z.object({
  name: z.string().min(2, 'Apartment name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  status: z.enum(['active', 'inactive']),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;

interface ApartmentFormProps {
  initialData?: Partial<ApartmentFormData>;
  onSubmit: (data: ApartmentFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ApartmentForm: React.FC<ApartmentFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      status: initialData?.status || 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Apartment Name"
        placeholder="e.g. Sunrise Heights Apartments"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Full Address"
        placeholder="e.g. 123 Palm Grove Ave, Sector 4"
        error={errors.address?.message}
        {...register('address')}
      />

      <Select
        label="Status"
        options={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        error={errors.status?.message}
        {...register('status')}
      />

      <div className="pt-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Apartment' : 'Create Apartment'}
        </Button>
      </div>
    </form>
  );
};
