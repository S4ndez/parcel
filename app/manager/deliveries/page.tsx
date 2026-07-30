'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { PackageCheck, CheckCircle2, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function DeliveriesPage() {
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/deliveries?page=${page}&limit=10&search=${search}&status=${statusFilter}`
      );
      if (res.data.success) {
        setDeliveries(res.data.data.items);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to fetch deliveries', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleMarkCollected = async (id: string) => {
    try {
      const res = await axios.patch(`/api/deliveries/${id}`);
      if (res.data.success) {
        showToast('Delivery marked as collected', 'success');
        fetchDeliveries();
      }
    } catch (err) {
      showToast('Failed to update delivery status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery log?')) return;
    try {
      await axios.delete(`/api/deliveries/${id}`);
      showToast('Delivery record deleted', 'success');
      fetchDeliveries();
    } catch (err) {
      showToast('Failed to delete delivery', 'error');
    }
  };

  const columns = [
    {
      header: 'Flat Number',
      cell: (row: any) => (
        <span className="font-bold text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-800/60">
          Flat {row.flatId?.flatNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Courier & Tracking',
      cell: (row: any) => (
        <div>
          <p className="font-semibold text-slate-100">{row.courier}</p>
          <p className="text-xs text-slate-400">{row.trackingNumber || 'No tracking ID'}</p>
        </div>
      ),
    },
    {
      header: 'Delivered Timestamp',
      cell: (row: any) => (
        <div>
          <p className="text-xs text-slate-200 font-medium">
            {new Date(row.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[11px] text-slate-400">{new Date(row.deliveredAt).toLocaleDateString()}</p>
        </div>
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
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkCollected(row._id)}
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Mark Collected
            </Button>
          ) : (
            <span className="text-xs text-slate-500 font-medium">✓ Collected</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={() => handleDelete(row._id)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliveries & Parcels Log"
        subtitle="Search, filter, and track parcel deliveries across all apartment units."
      />

      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by courier or tracking ID..."
          />

          <div className="w-full sm:w-48">
            <Select
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Pending Pickup', value: 'pending' },
                { label: 'Collected', value: 'collected' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading deliveries log...</div>
        ) : (
          <>
            <Table columns={columns} data={deliveries} emptyMessage="No parcel deliveries found." />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
