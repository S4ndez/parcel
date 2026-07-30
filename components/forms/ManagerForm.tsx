'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const managerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  apartmentId: z.string().min(1, 'Apartment selection is required'),
});

export type ManagerFormData = z.infer<typeof managerSchema>;

interface ManagerFormProps {
  apartments: Array<{ _id: string; name: string }>;
  initialData?: Partial<ManagerFormData>;
  onSubmit: (data: ManagerFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ManagerForm: React.FC<ManagerFormProps> = ({
  apartments,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      apartmentId: initialData?.apartmentId || '',
    },
  });

  const aptOptions = [
    { label: 'Select Apartment', value: '' },
    ...apartments.map((apt) => ({ label: apt.name, value: apt._id })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Manager Full Name"
        placeholder="e.g. Rahul Sharma"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="e.g. rahul@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label={initialData ? 'New Password (leave blank to keep current)' : 'Password'}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Select
        label="Assigned Apartment"
        options={aptOptions}
        error={errors.apartmentId?.message}
        {...register('apartmentId')}
      />

      <div className="pt-2 flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Manager' : 'Add Manager'}
        </Button>
      </div>
    </form>
  );
};
