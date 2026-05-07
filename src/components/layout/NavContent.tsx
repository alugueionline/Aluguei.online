import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Building2, 
  Users, 
  ArrowUpDown, 
  DollarSign, 
  BarChart3,
  Settings,
  Wallet,
  Wrench,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Home, label: 'Imóveis', path: '/properties' },
  { icon: Users, label: 'Locatários', path: '/tenants' },
  { icon: DollarSign, label: 'Financeiro', path: '/financial' },
  { icon: ArrowUpDown, label: 'Receitas / Despesas', path: '/billing' },
  { icon: Wrench, label: 'Manutenção', path: '/maintenance' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
];

interface NavContentProps {
  onItemClick?: () => void;
}

export const NavContent = ({ onItemClick }: NavContentProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
            <Wallet className="text-blue-500 w-6 h-6 stroke-[2.5px]" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">Jonas<span className="text-blue-600">Pay</span></span>
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
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 stroke-[2.5px]", 
                  isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-50">
        <Link
          to="/settings"
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group",
            location.pathname === '/settings'
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Settings className={cn(
            "w-5 h-5 stroke-[2.5px]", 
            location.pathname === '/settings' ? "text-white" : "text-slate-400 group-hover:text-blue-600"
          )} />
          Configurações
        </Link>
      </div>
    </div>
  );
};