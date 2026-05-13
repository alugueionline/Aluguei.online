"use client";

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  Wrench, 
  Calendar, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  User as UserIcon,
  ArrowRightLeft,
  Settings
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Imóveis", path: "/properties" },
  { icon: Users, label: "Inquilinos", path: "/tenants" },
  { icon: FileText, label: "Contratos", path: "/contracts" },
  { icon: DollarSign, label: "Financeiro", path: "/financial" },
  { icon: Wrench, label: "Manutenção", path: "/maintenance" },
  { icon: Calendar, label: "Calendário", path: "/calendar" },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";
  const ICON_LOGO = "https://i.ibb.co/cKz69Xd3/ICONE-CLARO.png";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const userName = user?.user_metadata?.full_name || "Usuário";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-screen bg-white border-r border-slate-100 transition-all duration-500 sticky top-0 z-50",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between mb-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src={logoUrl} alt="Aluguei.Online" className="h-8 w-auto object-contain" />
          </div>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center cursor-pointer mx-auto" onClick={() => navigate('/dashboard')}>
            <img src={ICON_LOGO} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}>
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                {!collapsed && <span className="font-semibold text-sm tracking-tight">{item.label}</span>}
                {isActive && !collapsed && <div className="absolute right-2 w-1 h-1 rounded-full bg-white/40" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-50 space-y-2">
        <Link to="/settings">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all group",
            collapsed && "justify-center"
          )}>
            <Avatar className="w-8 h-8 rounded-lg border border-slate-100 shadow-sm">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">Configurações</p>
              </div>
            )}
          </div>
        </Link>
        
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 h-10 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 font-semibold text-xs",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;