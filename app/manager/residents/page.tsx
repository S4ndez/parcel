'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { ResidentForm, ResidentFormData } from '@/components/forms/ResidentForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Phone, MessageSquare } from 'lucide-react';
import axios from 'axios';

export default function ResidentsPage() {
  const { showToast } = useToast();
  const [residents, setResidents] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRes, flatsRes] = await Promise.all([
        axios.get(`/api/residents?page=${page}&limit=10&search=${search}`),
        axios.get('/api/flats?all=true'),
      ]);

      if (resRes.data.success) {
        setResidents(resRes.data.data.items);
        setTotalPages(resRes.data.data.totalPages);
      }
      if (flatsRes.data.success) {
        setFlats(flatsRes.data.data || []);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to fetch residents', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCreateOrUpdate = async (data: ResidentFormData) => {
    try {
      setSubmitting(true);
      if (editingResident) {
        await axios.put(`/api/residents/${editingResident._id}`, data);
        showToast('Resident profile updated', 'success');
      } else {
        await axios.post('/api/residents', data);
        showToast('Resident mapped to flat & WhatsApp successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingResident(null);
      fetchInitialData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save resident', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resident mapping?')) return;
    try {
      await axios.delete(`/api/residents/${id}`);
      showToast('Resident deleted', 'success');
      fetchInitialData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete resident', 'error');
    }
  };

  const columns = [
    {
      header: 'Resident Name',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{row.name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" /> {row.whatsappNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Mapped Flat',
      cell: (row: any) => (
        <span className="font-bold text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-800/60">
          Flat {row.flatId?.flatNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'WhatsApp Status',
      cell: () => (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
          <MessageSquare className="w-3 h-3" /> Mapped
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingResident({
                ...row,
                flatId: row.flatId?._id || row.flatId,
              });
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
        title="Apartment Residents"
        subtitle="Add resident details and map their WhatsApp phone numbers to flat numbers."
        action={
          <Button
            onClick={() => {
              setEditingResident(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Resident
          </Button>
        }
      />

      <Card className="space-y-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search resident name or phone number..." />

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading residents...</div>
        ) : (
          <>
            <Table columns={columns} data={residents} emptyMessage="No residents added yet." />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResident ? 'Edit Resident Details' : 'Add Resident & Map WhatsApp'}
      >
        <ResidentForm
          flats={flats}
          initialData={editingResident}
          onSubmit={handleCreateOrUpdate}
          isLoading={submitting}
        />
      </Modal>
    </div>
  );
}
