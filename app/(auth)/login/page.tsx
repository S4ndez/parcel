'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Package, Lock, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@parcelflow.com',
      password: 'AdminPassword123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setErrorMsg('');

      const response = await axios.post('/api/auth/login', data);

      if (response.data.success) {
        const role = response.data.data.role;
        if (role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/manager');
        }
        router.refresh();
      } else {
        setErrorMsg(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ParcelFlow</h1>
          <p className="text-sm text-slate-400">Sign in to your administrative dashboard</p>
        </div>

        {/* Form Card */}
        <Card className="p-8 bg-slate-900 border-slate-800 shadow-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@parcelflow.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Role-based secure access</span>
              <Link
                href="/forgot-password"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold py-3"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Default Super Admin Credentials:</p>
            <p>Email: <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">admin@parcelflow.com</code></p>
            <p>Password: <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">AdminPassword123!</code></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
