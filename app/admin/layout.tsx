import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== 'super_admin') {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar role="super_admin" userName={session.name} userEmail={session.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Super Admin Workspace" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
