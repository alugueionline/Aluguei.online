"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, CreditCard, AlertTriangle, CheckCircle2, Wallet, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

interface TenantProfileCardProps {
  tenant: any;
  financialData: {
    totalOverdue: number;
    totalPaid: number;
  } | undefined;
}

export const TenantProfileCard = ({ tenant, financialData }: TenantProfileCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ status: newStatus })
        .eq('id', tenant.id);

      if (error) throw error;

      showSuccess(`Status de ${tenant.name} alterado para ${newStatus}.`);
      queryClient.invalidateQueries({ queryKey: ['tenant', tenant.id] });
      queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-collection-list'] });
    } catch (err: any) {
      showError("Erro ao atualizar status: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
        <div className="h-32 bg-blue-600 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        </div>
        <CardContent className="relative pt-0">
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-12 h-12" />
              </div>
            </div>
          </div>
          <div className="pt-16 pb-6 flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{tenant.name}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inquilino desde {new Date(tenant.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Gestão</label>
              <Select 
                disabled={isUpdating} 
                value={tenant.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className={cn(
                  "h-11 rounded-xl border-none font-bold shadow-sm transition-all",
                  tenant.status === 'ativo' ? "bg-emerald-50 text-emerald-700" : 
                  tenant.status === 'pendente' ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                )}>
                  <div className="flex items-center gap-2">
                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className={cn("w-2 h-2 rounded-full", tenant.status === 'ativo' ? "bg-emerald-500" : "bg-amber-500")} />}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="ativo" className="font-bold text-emerald-600">Ativo (Cobra Aluguel)</SelectItem>
                  <SelectItem value="pendente" className="font-bold text-amber-600">Pendente (Pausa Cobranças)</SelectItem>
                  <SelectItem value="encerrado" className="font-bold text-slate-600">Encerrado</SelectItem>
                </SelectContent>
              </Select>
              {tenant.status === 'pendente' && (
                <p className="text-[10px] text-amber-600 font-medium italic px-1">
                  * Inquilinos pendentes não aparecem no Dashboard financeiro.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-50 pt-6">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">{tenant.phone || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold truncate">{tenant.email || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">CPF: {tenant.cpf || 'Não informado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card className={cn(
          "border-none shadow-sm rounded-[2rem] transition-all", 
          financialData?.totalOverdue && financialData.totalOverdue > 0 ? "bg-rose-50 border-rose-100" : "bg-white"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "text-[10px] font-black flex items-center gap-2 uppercase tracking-widest", 
              financialData?.totalOverdue && financialData.totalOverdue > 0 ? "text-rose-800" : "text-slate-400"
            )}>
              {financialData?.totalOverdue && financialData.totalOverdue > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} 
              Dívida Atrasada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-black tracking-tight", financialData?.totalOverdue && financialData.totalOverdue > 0 ? "text-rose-900" : "text-slate-900")}>
              R$ {financialData?.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-blue-50 border-blue-100 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-blue-800 flex items-center gap-2 uppercase tracking-widest">
              <Wallet className="w-4 h-4" /> Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-blue-900 tracking-tight">
              R$ {financialData?.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};