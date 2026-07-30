'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { User, Building2, Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ManagerSettingsPage() {
  const { showToast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUserData(res.data.data);
        }
      } catch (err: any) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [showToast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setSaving(true);
      await axios.put(`/api/managers/${userData._id}`, { password });
      showToast('Password updated successfully', 'success');
      setPassword('');
    } catch (err: any) {
      showToast('Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading manager settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Manager Account Settings" subtitle="View assigned building profile & security credentials." />

      <Card className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">{userData?.name}</h3>
            <p className="text-xs text-slate-400">{userData?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Assigned Apartment
            </span>
            <p className="font-semibold text-slate-100 text-sm">{userData?.apartmentId?.name || 'Unassigned'}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{userData?.apartmentId?.address}</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account Role
            </span>
            <p className="font-semibold text-slate-100 text-sm">Apartment Manager</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Role-Based Access Control</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" /> Change Password
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
