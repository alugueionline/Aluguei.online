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
  Settings,
  LogOut,
  ChevronLeft,
  User
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const userName = user?.user_metadata?.full_name || "Usuário";
  const userEmail = user?.email || "";

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-gray-100 transition-all duration-500 z-50 flex flex-col",
      collapsed ? "w-24" : "w-72"
    )}>
      <div className="p-8 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">ALUGUEI<span className="text-[#2563FF]">.</span></span>
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

      <nav className="flex-1 px-4 space-y-2 mt-4">
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
        <div className={cn("flex items-center gap-4 mb-6", collapsed && "justify-center")}>
          <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
            <AvatarFallback><User /></AvatarFallback>
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