import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md px-4 md:px-8 py-4 flex justify-between items-center border-b border-gray-100 lg:border-none">
          <div className="flex items-center gap-3">
            <MobileNav />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Gestor Imobiliário</p>
            </div>
            <Avatar className="w-9 h-9 md:w-10 md:h-10 border-2 border-white shadow-sm">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
              <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};