"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  DollarSign, 
  ArrowUpDown, 
  Wrench, 
  BarChart3, 
  FileText, 
  Calendar, 
  Bell, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Home, label: 'Imóveis', path: '/properties' },
  { icon: Users, label: 'Locatários', path: '/tenants' },
  { icon: DollarSign, label: 'Financeiro', path: '/financial' },
  { icon: ArrowUpDown, label: 'Receitas / Despesas', path: '/billing' },
  { icon: Wrench, label: 'Manutenção', path: '/maintenance' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: FileText, label: 'Contratos', path: '/contracts' },
  { icon: Calendar, label: 'Calendário', path: '/calendar' },
  { icon: Bell, label: 'Avisos', path: '/alerts' },
];

interface NavContentProps {
  onItemClick?: () => void;
}

export const NavContent = ({ onItemClick }: NavContentProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";

  const handleUserClick = () => {
    navigate('/settings');
    if (onItemClick) onItemClick();
  };

  const handleLogout = () => {
    navigate('/');
    if (onItemClick) onItemClick();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8">
        <div className="flex items-center mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain mr-2" />
          <span className="text-lg font-black text-slate-900 tracking-tight">Aluguei<span className="text-blue-600">Online</span></span>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "sidebar-item-active" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5", 
                  isActive ? "text-white" : "text-gray-400 group-hover:text-[#2563FF]"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-rose-600" />
            Sair do Sistema
          </button>
        </div>

        <div 
          onClick={handleUserClick}
          className="p-4 bg-[#F7F9FC] rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jonas" />
              <AvatarFallback className="bg-[#2563FF] text-white">JS</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Jonas Silva</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Assinante</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};