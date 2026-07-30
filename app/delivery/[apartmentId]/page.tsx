'use client';

import React, { useEffect, useState, use } from 'react';
import { Card } from '@/components/ui/Card';
import { DeliveryForm, DeliveryFormData } from '@/components/forms/DeliveryForm';
import { PackageCheck, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface PublicDeliveryPageProps {
  params: Promise<{ apartmentId: string }>;
}

export default function PublicDeliveryPage({ params }: PublicDeliveryPageProps) {
  const { apartmentId } = use(params);

  const [apartment, setApartment] = useState<any>(null);
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [aptRes, flatsRes] = await Promise.all([
          axios.get(`/api/apartments/${apartmentId}`),
          axios.get(`/api/flats?apartmentId=${apartmentId}&all=true`),
        ]);

        if (aptRes.data.success) {
          setApartment(aptRes.data.data);
        }
        if (flatsRes.data.success) {
          setFlats(flatsRes.data.data || []);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Apartment not found or inactive.');
      } finally {
        setLoading(false);
      }
    }
    if (apartmentId) {
      fetchData();
    }
  }, [apartmentId]);

  const handleSubmit = async (data: DeliveryFormData) => {
    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await axios.post('/api/deliveries/public', {
        apartmentId,
        flatId: data.flatId,
        courier: data.courier,
        trackingNumber: data.trackingNumber,
      });

      if (res.data.success) {
        setSuccessMsg(true);
      } else {
        setErrorMsg(res.data.error || 'Failed to submit delivery');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to log delivery');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-400">Loading Delivery Portal...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
        <Card className="max-w-md w-full text-center p-8 bg-slate-900 border-slate-800">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid QR Code</h2>
          <p className="text-sm text-slate-400">{errorMsg}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-1 border border-indigo-500/30">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Parcel Delivery Portal</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-indigo-300 font-medium">
            <Building2 className="w-4 h-4" />
            <span>{apartment?.name || 'Apartment Building'}</span>
          </div>
          <p className="text-xs text-slate-400 px-4">{apartment?.address}</p>
        </div>

        {/* Success Alert */}
        {successMsg ? (
          <Card className="bg-emerald-950/80 border-emerald-800 text-center p-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Delivery Recorded!</h3>
              <p className="text-xs text-emerald-200">
                Resident has been notified via WhatsApp automatically.
              </p>
            </div>
            <button
              onClick={() => setSuccessMsg(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
            >
              Log Another Delivery
            </button>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-800 p-6 shadow-2xl">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <DeliveryForm flats={flats} onSubmit={handleSubmit} isLoading={submitting} />
          </Card>
        )}

        <p className="text-center text-[11px] text-slate-500">
          Powered by <strong className="text-slate-400">ParcelFlow</strong> • Quick Entrance Check-In
        </p>
      </div>
    </div>
  );
}
