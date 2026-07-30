'use client';

import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Bell } from 'lucide-react';

interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title || 'Dashboard'}</h2>
      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};
