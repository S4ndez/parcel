'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { siteConfig } from '@/config/site';

const deliverySchema = z.object({
  flatId: z.string().min(1, 'Please select flat number'),
  courier: z.string().min(1, 'Please select courier company'),
  trackingNumber: z.string().optional(),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;

interface DeliveryFormProps {
  flats: Array<{ _id: string; flatNumber: string }>;
  onSubmit: (data: DeliveryFormData) => Promise<void>;
  isLoading?: boolean;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  flats,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      flatId: '',
      courier: 'Amazon',
      trackingNumber: '',
    },
  });

  const flatOptions = [
    { label: '-- Search / Select Flat --', value: '' },
    ...flats.map((f) => ({ label: `Flat ${f.flatNumber}`, value: f._id })),
  ];

  const courierOptions = siteConfig.couriers.map((c) => ({ label: c, value: c }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Select
        label="1. Select Flat Number"
        options={flatOptions}
        error={errors.flatId?.message}
        {...register('flatId')}
      />

      <Select
        label="2. Select Courier Partner"
        options={courierOptions}
        error={errors.courier?.message}
        {...register('courier')}
      />

      <Input
        label="3. Tracking Number (Optional)"
        placeholder="e.g. AMZ12345678"
        error={errors.trackingNumber?.message}
        {...register('trackingNumber')}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg py-3.5"
          isLoading={isLoading}
        >
          ✓ Mark Delivered
        </Button>
      </div>
    </form>
  );
};
