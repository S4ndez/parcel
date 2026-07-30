'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  PackageCheck,
  Settings,
  LogOut,
  Package,
} from 'lucide-react';
import { UserRole } from '@/types';
import axios from 'axios';

interface SidebarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
}

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  PackageCheck,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({ role, userName, userEmail }) => {
  const pathname = usePathname();
  const router = useRouter();

  const adminNav = [
    { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { title: 'Apartments', href: '/admin/apartments', icon: 'Building2' },
    { title: 'Managers', href: '/admin/managers', icon: 'Users' },
    { title: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ];

  const managerNav = [
    { title: 'Dashboard', href: '/manager', icon: 'LayoutDashboard' },
    { title: 'Flats', href: '/manager/flats', icon: 'Home' },
    { title: 'Residents', href: '/manager/residents', icon: 'Users' },
    { title: 'Deliveries', href: '/manager/deliveries', icon: 'PackageCheck' },
    { title: 'Settings', href: '/manager/settings', icon: 'Settings' },
  ];

  const navItems = role === 'super_admin' ? adminNav : managerNav;

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight">ParcelFlow</h1>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
            {role === 'super_admin' ? 'Super Admin' : 'Apartment Manager'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{userName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail || ''}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
