'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ManagerForm, ManagerFormData } from '@/components/forms/ManagerForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ManagersPage() {
  const { showToast } = useToast();
  const [managers, setManagers] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [mgrRes, aptRes] = await Promise.all([
        axios.get('/api/managers'),
        axios.get('/api/apartments?limit=100'),
      ]);

      if (mgrRes.data.success) {
        setManagers(mgrRes.data.data || []);
      }
      if (aptRes.data.success) {
        setApartments(aptRes.data.data.items || []);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to fetch managers', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCreateOrUpdate = async (data: ManagerFormData) => {
    try {
      setSubmitting(true);
      if (editingManager) {
        await axios.put(`/api/managers/${editingManager._id}`, data);
        showToast('Manager account updated', 'success');
      } else {
        await axios.post('/api/managers', data);
        showToast('Apartment manager account created successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingManager(null);
      fetchInitialData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save manager', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manager account?')) return;
    try {
      await axios.delete(`/api/managers/${id}`);
      showToast('Manager account deleted', 'success');
      fetchInitialData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete manager', 'error');
    }
  };

  const columns = [
    {
      header: 'Manager Name',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Apartment',
      cell: (row: any) => (
        <span className="text-sm font-medium text-slate-200">
          {row.apartmentId?.name || 'Unassigned'}
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
              setEditingManager({
                ...row,
                apartmentId: row.apartmentId?._id || row.apartmentId,
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
        title="Apartment Managers"
        subtitle="Manage login credentials and apartment assignments for building managers."
        action={
          <Button
            onClick={() => {
              setEditingManager(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Manager
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading managers...</div>
        ) : (
          <Table columns={columns} data={managers} emptyMessage="No apartment managers added yet." />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingManager ? 'Edit Manager' : 'Add Apartment Manager'}
      >
        <ManagerForm
          apartments={apartments}
          initialData={editingManager}
          onSubmit={handleCreateOrUpdate}
          isLoading={submitting}
        />
      </Modal>
    </div>
  );
}
