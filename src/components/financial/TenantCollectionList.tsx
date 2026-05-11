"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, DollarSign, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BillingSummaryModal } from './BillingSummaryModal';
import { cn } from '@/lib/utils';

export const TenantCollectionList = () => {
  const [loading, setLoading] = useState(true);
  const [tenantDebts, setTenantDebts] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar inquilinos ativos
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, phone, properties(name)')
        .eq('status', 'ativo');

      // 2. Buscar faturas pendentes
      const { data: bills } = await supabase
        .from('bills')
        .select('tenant_id, total_value, calculated_value')
        .eq('status', 'pendente');

      // 3. Agrupar dívidas por inquilino
      const debtsMap = (bills || []).reduce((acc: any, bill: any) => {
        const id = bill.tenant_id;
        if (!id) return acc;
        const val = Number(bill.calculated_value || bill.total_value || 0);
        acc[id] = (acc[id] || 0) + val;
        return acc;
      }, {});

      // 4. Formatar lista final
      const finalData = (tenants || []).map(t => ({
        ...t,
        totalDebt: debtsMap[t.id] || 0
      })).sort((a, b) => b.totalDebt - a.totalDebt);

      setTenantDebts(finalData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCollect = (id: string) => {
    setSelectedTenantId(id);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-400 mt-4 font-medium">Calculando pendências...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tenantDebts.map((tenant) => (
        <Card key={tenant.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden bg-white group">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Avatar className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.name}`} />
                <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                  {tenant.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{tenant.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-500" /> {tenant.properties?.name || 'Sem imóvel'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Pendente</p>
                <p className={cn(
                  "text-xl font-black tracking-tight",
                  tenant.totalDebt > 0 ? "text-rose-600" : "text-emerald-600"
                )}>
                  R$ {tenant.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <Button 
                onClick={() => handleCollect(tenant.id)}
                className={cn(
                  "h-12 px-6 rounded-2xl font-black gap-2 transition-all active:scale-95 shadow-lg",
                  tenant.totalDebt > 0 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100" 
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 shadow-none"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Cobrar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {tenantDebts.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">Nenhum inquilino ativo encontrado.</p>
        </div>
      )}

      <BillingSummaryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tenantId={selectedTenantId}
      />
    </div>
  );
};