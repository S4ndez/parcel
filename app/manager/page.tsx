'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/layout/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Home, Users, PackageCheck, Clock, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/components/ui/Toast';

export default function ManagerDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadManagerDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, delivRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/deliveries?limit=5'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (delivRes.data.success) {
        setRecentDeliveries(delivRes.data.data.items || []);
      }
    } catch (err: any) {
      console.error('Failed to load manager stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerDashboard();
  }, []);

  const handleMarkCollected = async (id: string) => {
    try {
      const res = await axios.patch(`/api/deliveries/${id}`);
      if (res.data.success) {
        showToast('Marked parcel as collected by resident', 'success');
        loadManagerDashboard();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const deliveryColumns = [
    {
      header: 'Flat Unit',
      cell: (row: any) => (
        <span className="font-bold text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-800/60">
          Flat {row.flatId?.flatNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Courier',
      cell: (row: any) => (
        <div>
          <p className="font-semibold text-slate-100">{row.courier}</p>
          <p className="text-xs text-slate-400">{row.trackingNumber || 'No tracking ID'}</p>
        </div>
      ),
    },
    {
      header: 'Delivered At',
      cell: (row: any) => (
        <span className="text-xs text-slate-300">
          {new Date(row.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
          {new Date(row.deliveredAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row: any) => (
        <Badge variant={row.status === 'collected' ? 'neutral' : 'warning'}>
          {row.status === 'collected' ? 'Collected' : 'Pending Pickup'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      cell: (row: any) =>
        row.status === 'pending' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkCollected(row._id)}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Mark Collected
          </Button>
        ) : (
          <span className="text-xs text-slate-500 font-medium">✓ Done</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apartment Manager Dashboard"
        subtitle="Manage flats, residents, and incoming parcel deliveries."
        action={
          <div className="flex items-center gap-3">
            <Link href="/manager/flats">
              <Button variant="outline" icon={<Plus className="w-4 h-4" />}>
                Add Flat
              </Button>
            </Link>
            <Link href="/manager/residents">
              <Button icon={<Plus className="w-4 h-4" />}>Add Resident</Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Flats"
          value={loading ? '...' : stats?.totalFlats || 0}
          description="Configured apartment units"
          icon={<Home className="w-6 h-6" />}
        />
        <StatsCard
          title="Mapped Residents"
          value={loading ? '...' : stats?.totalResidents || 0}
          description="WhatsApp mapped residents"
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Pending Pickups"
          value={loading ? '...' : stats?.pendingDeliveries || 0}
          description="Awaiting resident pickup"
          icon={<Clock className="w-6 h-6" />}
        />
        <StatsCard
          title="Today's Deliveries"
          value={loading ? '...' : stats?.todayDeliveries || 0}
          description={`Total all-time: ${stats?.totalDeliveries || 0}`}
          icon={<PackageCheck className="w-6 h-6" />}
        />
      </div>

      {/* Recent Deliveries */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">Latest Parcel Deliveries</h3>
          <Link
            href="/manager/deliveries"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading deliveries...</div>
        ) : (
          <Table columns={deliveryColumns} data={recentDeliveries} emptyMessage="No parcel deliveries logged today." />
        )}
      </Card>
    </div>
  );
}
