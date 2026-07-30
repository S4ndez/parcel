'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/layout/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Home, Users, PackageCheck, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentApartments, setRecentApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, aptsRes] = await Promise.all([
          axios.get('/api/stats'),
          axios.get('/api/apartments?limit=5'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (aptsRes.data.success) {
          setRecentApartments(aptsRes.data.data.items || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Overview of onboarded apartments, managers, and parcel traffic."
        action={
          <Link href="/admin/apartments">
            <Button icon={<Plus className="w-4 h-4" />}>Add Apartment</Button>
          </Link>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Apartments"
          value={loading ? '...' : stats?.totalApartments || 0}
          description="Onboarded properties"
          icon={<Building2 className="w-6 h-6" />}
        />
        <StatsCard
          title="Total Flats"
          value={loading ? '...' : stats?.totalFlats || 0}
          description="Mapped apartment units"
          icon={<Home className="w-6 h-6" />}
        />
        <StatsCard
          title="Apartment Managers"
          value={loading ? '...' : stats?.totalManagers || 0}
          description="Active manager accounts"
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Today's Deliveries"
          value={loading ? '...' : stats?.todayDeliveries || 0}
          description={`Total all-time: ${stats?.totalDeliveries || 0}`}
          icon={<PackageCheck className="w-6 h-6" />}
        />
      </div>

      {/* Recent Apartments */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-100">Recently Onboarded Apartments</h3>
          <Link
            href="/admin/apartments"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentApartments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No apartments onboarded yet.</p>
          ) : (
            recentApartments.map((apt) => (
              <div
                key={apt._id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-100">{apt.name}</h4>
                    <p className="text-xs text-slate-400">{apt.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      apt.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                  <Link href={`/admin/apartments/${apt._id}`}>
                    <Button variant="outline" size="sm">
                      Manage & QR
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
