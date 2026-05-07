"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-4 md:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <MobileNav />
            <div className="relative w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 bg-[#161B22] border-none text-white w-full h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 bg-[#0B0E14] px-1.5 py-0.5 rounded border border-white/10">
                ⌘ K
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0B0E14]"></span>
            </button>
            
            <div className="flex items-center gap-3 bg-[#161B22] p-1.5 pr-4 rounded-full border border-white/5 cursor-pointer hover:bg-[#1c222b] transition-colors">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">Maio de 2024</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);