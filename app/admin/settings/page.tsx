'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ShieldCheck, Database, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeedAdmin = async () => {
    try {
      setSeeding(true);
      const res = await axios.post('/api/auth/seed');
      if (res.data.success) {
        showToast(res.data.data.message || 'Database seeded', 'success');
      }
    } catch (err: any) {
      showToast('Failed to seed database', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Platform Settings"
        subtitle="Global configuration, database seeding, and WhatsApp integration status."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Super Admin Configuration</h3>
              <p className="text-xs text-slate-400">Manage global system administrators</p>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Super admin role has full access to add apartments, assign managers, regenerate QR codes, and monitor system metrics.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedAdmin}
            isLoading={seeding}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Verify / Seed Admin Account
          </Button>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">WhatsApp Cloud Webhook</h3>
              <p className="text-xs text-slate-400">Automated resident queries</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>
              Webhook URL:{' '}
              <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                /api/webhook/whatsapp
              </code>
            </p>
            <p>
              Verify Token:{' '}
              <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                parcelflow_whatsapp_verify_token
              </code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
