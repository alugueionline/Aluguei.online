"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock, Loader2, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BillingSummaryModal } from './BillingSummaryModal';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const TenantCollectionList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenantDebts, setTenantDebts] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      // Buscamos inquilinos e todos os seus contratos (para lidar com múltiplos imóveis)
      const { data: tenants } = await supabase
        .from('tenants')
        .select(`
          id, 
          name, 
          phone, 
          properties(name),
          contracts(rent_value, status, property_id)
        `)
        .eq('status', 'ativo');

      const { data: bills } = await supabase
        .from('bills')
        .select('tenant_id, property_id, type, total_value, calculated_value, status, month, year');

      const finalData = (tenants || []).map(t => {
        const activeContracts = t.contracts?.filter((c: any) => c.status === 'ativo') || [];
        
        // 1. Pegar todas as faturas PENDENTES ou ATRASADAS deste inquilino (Luz, Internet, Aluguéis já gerados)
        const pendingBills = (bills || []).filter(b => 
          b.tenant_id === t.id && (b.status === 'pendente' || b.status === 'atrasado')
        );

        const existingBillsTotal = pendingBills.reduce((acc, b) => 
          acc + Number(b.calculated_value || b.total_value || 0), 0
        );

        // 2. Verificar para CADA contrato ativo se o aluguel do mês atual já foi faturado
        let projectedRent = 0;
        let projectedCount = 0;

        activeContracts.forEach((contract: any) => {
          const rentAlreadyBilled = (bills || []).some(b => 
            b.tenant_id === t.id && 
            b.property_id === contract.property_id &&
            b.type === 'aluguel' && 
            b.month === currentMonth && 
            b.year === currentYear
          );

          if (!rentAlreadyBilled) {
            projectedRent += Number(contract.rent_value || 0);
            projectedCount++;
          }
        });
        
        // Soma Final: Faturas existentes + Projeções de aluguel não faturados
        const totalDebt = existingBillsTotal + projectedRent;

        return {
          ...t,
          totalDebt,
          pendingCount: pendingBills.length + projectedCount,
          hasOverdue: pendingBills.some(b => b.status === 'atrasado'),
          breakdown: {
            projectedRent,
            pendingBills: pendingBills
          }
        };
      }).sort((a, b) => b.totalDebt - a.totalDebt);

      setTenantDebts(finalData);
    } catch (err) {
      console.error('Erro ao calcular cobranças:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCollect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedTenantId(id);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-400 mt-4 font-medium">Calculando débitos totais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        {tenantDebts.map((tenant) => (
          <Card 
            key={tenant.id} 
            className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden bg-white group cursor-pointer"
            onClick={() => navigate(`/tenants/${tenant.id}`)}
          >
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Avatar className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm group-hover:border-blue-200 transition-all">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.name}`} />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                    {tenant.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{tenant.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-blue-500" /> 
                    {tenant.contracts?.length > 1 
                      ? `${tenant.contracts.length} Contratos Ativos` 
                      : (tenant.properties?.name || 'Sem imóvel')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-2 md:justify-end">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Pendente</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-300 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-white border-none p-4 rounded-2xl shadow-xl">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detalhamento</p>
                          
                          {tenant.breakdown.projectedRent > 0 && (
                            <div className="flex justify-between gap-8 text-xs">
                              <span>Aluguel (Mês Atual):</span>
                              <span className="font-bold text-amber-400">R$ {Number(tenant.breakdown.projectedRent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}

                          {tenant.breakdown.pendingBills.map((b: any, i: number) => (
                            <div key={i} className="flex justify-between gap-8 text-xs">
                              <span className="capitalize">{b.type} ({b.month}/{b.year}):</span>
                              <span className="font-bold">R$ {Number(b.calculated_value || b.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}

                          {tenant.breakdown.projectedRent === 0 && tenant.breakdown.pendingBills.length === 0 && (
                            <p className="text-xs text-slate-400 italic">Nenhum débito pendente</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    {tenant.hasOverdue && <AlertCircle className="w-3 h-3 text-rose-500" />}
                  </div>
                  <p className={cn(
                    "text-xl font-black tracking-tight",
                    tenant.totalDebt > 0 ? (tenant.hasOverdue ? "text-rose-600" : "text-amber-600") : "text-emerald-600"
                  )}>
                    R$ {tenant.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={(e) => handleCollect(e, tenant.id)}
                    className={cn(
                      "h-12 px-6 rounded-2xl font-black gap-2 transition-all active:scale-95 shadow-lg",
                      tenant.totalDebt > 0 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100" 
                        : "bg-slate-100 text-slate-400 shadow-none"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Cobrar
                  </Button>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TooltipProvider>

      <BillingSummaryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tenantId={selectedTenantId}
      />
    </div>
  );
};