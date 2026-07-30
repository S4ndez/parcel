'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const residentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  whatsappNumber: z.string().min(8, 'WhatsApp number must be valid'),
  flatId: z.string().min(1, 'Flat assignment is required'),
});

export type ResidentFormData = z.infer<typeof residentSchema>;

interface ResidentFormProps {
  flats: Array<{ _id: string; flatNumber: string }>;
  initialData?: Partial<ResidentFormData>;
  onSubmit: (data: ResidentFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ResidentForm: React.FC<ResidentFormProps> = ({
  flats,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      name: initialData?.name || '',
      whatsappNumber: initialData?.whatsappNumber || '',
      flatId: initialData?.flatId || '',
    },
  });

  const flatOptions = [
    { label: 'Select Flat', value: '' },
    ...flats.map((f) => ({ label: `Flat ${f.flatNumber}`, value: f._id })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Resident Name"
        placeholder="e.g. John Doe"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="WhatsApp Number"
        placeholder="e.g. +919876543210"
        error={errors.whatsappNumber?.message}
        {...register('whatsappNumber')}
      />

      <Select
        label="Assigned Flat"
        options={flatOptions}
        error={errors.flatId?.message}
        {...register('flatId')}
      />

      <div className="pt-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Resident' : 'Add Resident'}
        </Button>
      </div>
    </form>
  );
};
