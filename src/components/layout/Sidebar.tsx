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
  User as UserIcon
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Escutar mudanças no estado de autenticação e metadados do usuário
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
  const userEmail = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 sticky top-0 z-50",
      collapsed ? "w-24" : "w-72"
    )}>
      <div className="p-8 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src={logoUrl} alt="Aluguei.Online" className="h-10 w-auto object-contain" />
          </div>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl hover:bg-gray-50 text-gray-400"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-blue-50 text-[#2563FF]" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-[#2563FF]" : "text-gray-400 group-hover:text-gray-600")} />
                {!collapsed && <span className="font-bold text-sm">{item.label}</span>}
                {isActive && !collapsed && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#2563FF]" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-gray-50">
        <div 
          className={cn("flex items-center gap-4 mb-6 cursor-pointer hover:opacity-80 transition-opacity", collapsed && "justify-center")}
          onClick={() => navigate('/settings')}
        >
          <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-blue-600 text-white">
              <UserIcon className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-wider">{userEmail}</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-4 h-12 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair da Conta</span>}
        </Button>
      </div>
    </aside>
  );
};