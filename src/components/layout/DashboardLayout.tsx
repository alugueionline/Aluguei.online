"use client";

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Search, Bell, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const formattedDate = date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data";

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 md:px-10 py-5 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100/50">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <MobileNav />
            <div className="relative w-full hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2563FF] transition-colors" />
              <Input 
                placeholder="Buscar por imóveis, inquilinos ou contratos..." 
                className="pl-11 bg-gray-50/50 border-none text-gray-900 w-full h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2563FF]/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2.5 text-gray-400 hover:text-[#2563FF] hover:bg-blue-50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#2563FF] rounded-full border-2 border-white"></span>
            </button>
            
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all group">
                  <CalendarIcon className="w-4 h-4 text-[#2563FF]" />
                  <span className="text-xs font-bold text-gray-700 capitalize">{formattedDate}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </header>
        
        <div className="flex-1 p-6 md:p-10 pt-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};