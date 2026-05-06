import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Building2, 
  Users, 
  Receipt, 
  DollarSign, 
  BarChart3,
  Settings,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Home, label: 'Imóveis', path: '/properties' },
  { icon: Building2, label: 'Condomínios', path: '/condos' },
  { icon: Users, label: 'Inquilinos', path: '/tenants' },
  { icon: Receipt, label: 'Contas/Utilidades', path: '/billing' },
  { icon: DollarSign, label: 'Financeiro', path: '/financial' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">JonasPay</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <Settings className="w-5 h-5" />
          Configurações
        </button>
      </div>
    </aside>
  );
};