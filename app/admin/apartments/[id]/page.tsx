'use client';

import React, { useEffect, useState, use } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { QrCode, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/components/ui/Toast';

interface ApartmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [apartment, setApartment] = useState<any>(null);
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [aptRes, flatsRes] = await Promise.all([
          axios.get(`/api/apartments/${id}`),
          axios.get(`/api/flats?apartmentId=${id}&all=true`),
        ]);

        if (aptRes.data.success) {
          setApartment(aptRes.data.data);
        }
        if (flatsRes.data.success) {
          setFlats(flatsRes.data.data || []);
        }
      } catch (err: any) {
        showToast(err.response?.data?.error || 'Failed to load details', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id, showToast]);

  const handleRegenerateQR = async () => {
    try {
      setRegenerating(true);
      const res = await axios.post(`/api/apartments/${id}/qr`);
      if (res.data.success) {
        setApartment(res.data.data);
        showToast('QR Code regenerated successfully', 'success');
      }
    } catch (err: any) {
      showToast('Failed to regenerate QR', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading apartment details...</div>;
  }

  const flatColumns = [
    { header: 'Flat Number', accessorKey: 'flatNumber' },
    {
      header: 'Created At',
      cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={apartment?.name || 'Apartment Detail'}
        subtitle={apartment?.address}
        action={
          <div className="flex items-center gap-3">
            <Link href={`/delivery/${id}`} target="_blank">
              <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
                Test Delivery Portal
              </Button>
            </Link>
            <Button
              onClick={handleRegenerateQR}
              isLoading={regenerating}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Regenerate QR
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QR Code Card */}
        <Card className="md:col-span-1 text-center space-y-4">
          <h3 className="font-semibold text-slate-100 flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" /> Public Delivery QR
          </h3>

          {apartment?.qrCode ? (
            <div className="p-4 bg-white rounded-xl inline-block shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={apartment.qrCode} alt="Apartment QR Code" className="w-48 h-48 mx-auto" />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No QR Code generated</p>
          )}

          <div className="pt-2">
            <Badge variant={apartment?.status === 'active' ? 'success' : 'neutral'}>
              Status: {apartment?.status?.toUpperCase()}
            </Badge>
          </div>
        </Card>

        {/* Flats List Card */}
        <Card className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Registered Flats ({flats.length})</h3>
          </div>

          <Table columns={flatColumns} data={flats} emptyMessage="No flats added for this apartment yet." />
        </Card>
      </div>
    </div>
  );
}
