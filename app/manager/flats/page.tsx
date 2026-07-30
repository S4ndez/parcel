'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { FlatForm, FlatFormData } from '@/components/forms/FlatForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Home } from 'lucide-react';
import axios from 'axios';

export default function FlatsPage() {
  const { showToast } = useToast();
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFlats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/flats?page=${page}&limit=10&search=${search}`);
      if (res.data.success) {
        setFlats(res.data.data.items);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to fetch flats', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    fetchFlats();
  }, [fetchFlats]);

  const handleCreateOrUpdate = async (data: FlatFormData) => {
    try {
      setSubmitting(true);
      if (editingFlat) {
        await axios.put(`/api/flats/${editingFlat._id}`, data);
        showToast('Flat updated successfully', 'success');
      } else {
        await axios.post('/api/flats', data);
        showToast('Flat created successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingFlat(null);
      fetchFlats();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save flat', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flat?')) return;
    try {
      await axios.delete(`/api/flats/${id}`);
      showToast('Flat deleted', 'success');
      fetchFlats();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete flat', 'error');
    }
  };

  const columns = [
    {
      header: 'Flat Number',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
            <Home className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-100 text-base">Flat {row.flatNumber}</span>
        </div>
      ),
    },
    {
      header: 'Date Created',
      cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingFlat(row);
              setIsModalOpen(true);
            }}
            icon={<Edit2 className="w-3.5 h-3.5" />}
          />
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
        title="Apartment Flats"
        subtitle="Configure all apartment unit flat numbers (e.g. A101, A102, B201)."
        action={
          <Button
            onClick={() => {
              setEditingFlat(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Flat
          </Button>
        }
      />

      <Card className="space-y-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search flat number (e.g. A101)..." />

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading flats...</div>
        ) : (
          <>
            <Table columns={columns} data={flats} emptyMessage="No flats created yet." />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFlat ? 'Edit Flat Number' : 'Add New Flat Unit'}
      >
        <FlatForm
          initialData={editingFlat}
          onSubmit={handleCreateOrUpdate}
          isLoading={submitting}
        />
      </Modal>
    </div>
  );
}
