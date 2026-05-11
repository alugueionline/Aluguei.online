"use client";

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Search, Bell, ChevronDown, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const formattedDate = date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="px-6 md:px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <MobileNav />
            <div className="relative w-full hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input 
                placeholder="Pesquisar no sistema..." 
                className="pl-10 bg-slate-50/50 border-slate-200/60 text-sm w-full h-10 rounded-xl focus-visible:ring-blue-600/10 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all group">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 capitalize">{formattedDate}</span>
                  <ChevronDown className="w-3 h-3 text-slate-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>

            <div className="h-8 w-px bg-slate-100 mx-1" />

            <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};