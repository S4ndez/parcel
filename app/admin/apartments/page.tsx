'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { ApartmentForm, ApartmentFormData } from '@/components/forms/ApartmentForm';
import { useToast } from '@/components/ui/Toast';
import { Plus, QrCode, Edit2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function ApartmentsPage() {
  const { showToast } = useToast();
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrApt, setSelectedQrApt] = useState<any>(null);

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/apartments?page=${page}&limit=10&search=${search}`);
      if (res.data.success) {
        setApartments(res.data.data.items);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to fetch apartments', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const handleCreateOrUpdate = async (data: ApartmentFormData) => {
    try {
      setSubmitting(true);
      if (editingApartment) {
        await axios.put(`/api/apartments/${editingApartment._id}`, data);
        showToast('Apartment updated successfully', 'success');
      } else {
        await axios.post('/api/apartments', data);
        showToast('Apartment created with QR Code generated!', 'success');
      }
      setIsModalOpen(false);
      setEditingApartment(null);
      fetchApartments();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save apartment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this apartment?')) return;
    try {
      await axios.delete(`/api/apartments/${id}`);
      showToast('Apartment deleted', 'success');
      fetchApartments();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete apartment', 'error');
    }
  };

  const columns = [
    {
      header: 'Apartment Name',
      cell: (row: any) => (
        <div>
          <p className="font-semibold text-slate-100">{row.name}</p>
          <p className="text-xs text-slate-400">{row.address}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row: any) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedQrApt(row);
              setQrModalOpen(true);
            }}
            icon={<QrCode className="w-3.5 h-3.5" />}
          >
            QR
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingApartment(row);
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
        title="Apartments Management"
        subtitle="Create and configure apartment complexes & public delivery QR codes."
        action={
          <Button
            onClick={() => {
              setEditingApartment(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Apartment
          </Button>
        }
      />

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or address..." />
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading apartments...</div>
        ) : (
          <>
            <Table columns={columns} data={apartments} emptyMessage="No apartments found." />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Add / Edit Apartment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
      >
        <ApartmentForm
          initialData={editingApartment}
          onSubmit={handleCreateOrUpdate}
          isLoading={submitting}
        />
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={`Delivery QR Code - ${selectedQrApt?.name}`}
      >
        <div className="text-center space-y-4 py-2">
          {selectedQrApt?.qrCode ? (
            <div className="p-4 bg-white rounded-xl inline-block shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedQrApt.qrCode}
                alt="Apartment Delivery QR Code"
                className="w-56 h-56 mx-auto"
              />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No QR Code generated.</p>
          )}

          <p className="text-xs text-slate-400 px-4">
            Print this QR Code and paste it near the entrance desk. Delivery agents scan this code to mark parcels delivered.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {selectedQrApt?.qrCode && (
              <a
                href={selectedQrApt.qrCode}
                download={`qr-${selectedQrApt.name.replace(/\s+/g, '-').toLowerCase()}.png`}
              >
                <Button variant="primary">Download QR Image</Button>
              </a>
            )}

            <Link href={`/delivery/${selectedQrApt?._id}`} target="_blank">
              <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
                Test Link
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}
