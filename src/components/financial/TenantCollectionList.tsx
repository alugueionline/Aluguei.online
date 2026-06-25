"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock, Loader2, ChevronRight, AlertCircle, Info, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BillingSummaryModal } from './BillingSummaryModal';
import { QuickPaymentModal } from '@/components/modals/QuickPaymentModal';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTenantAvatar } from '@/utils/avatar';
import { isBillOverdue } from '@/utils/financial';

export const TenantCollectionList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: tenantDebts = [], isLoading } = useQuery({
    queryKey: ['tenant-collection-list'],
    queryFn: async () => {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();
      const currentDay = new Date().getDate();

      // Buscamos inquilinos ativos E encerrados (para cobrar ex-inquilinos com dívida)
      const { data: tenants } = await supabase
        .from('tenants')
        .select(`
          id, 
          name, 
          phone, 
          status,
          property_id,
          due_day,
          properties(name, condo_fee, base_rent),
          contracts(rent_value, status, property_id, due_day, properties(condo_fee))
        `)
        .in('status', ['ativo', 'encerrado']);

      const { data: bills } = await supabase
        .from('bills')
        .select('*');

      const processed = (tenants || []).map(t => {
        let activeContracts = t.contracts?.filter((c: any) => c.status === 'ativo') || [];
        
        // FALLBACK: Se não houver contrato ativo mas houver imóvel vinculado diretamente
        if (activeContracts.length === 0 && t.property_id) {
          activeContracts = [{
            property_id: t.property_id,
            rent_value: t.properties?.base_rent || 0,
            due_day: t.due_day || 5,
            status: 'ativo',
            properties: {
              condo_fee: t.properties?.condo_fee || 0,
              name: t.properties?.name || 'Imóvel'
            }
          }];
        }

        const tenantBills = (bills || []).filter(b => b.tenant_id === t.id);
        
        // Agrupar faturas por propriedade, tipo, mês e ano para compensação de pagamentos parciais
        const groups: Record<string, { paid: number, pending: number, bills: any[] }> = {};
        tenantBills.forEach((b: any) => {
          const key = `${b.property_id || 'none'}-${b.type}-${b.month}-${b.year}`;
          if (!groups[key]) {
            groups[key] = { paid: 0, pending: 0, bills: [] };
          }
          const val = Number(b.total_value || b.calculated_value || 0);
          if (b.status === 'pago') {
            groups[key].paid += val;
          } else {
            groups[key].pending += val;
          }
          groups[key].bills.push(b);
        });

        let existingBillsTotal = 0;
        let existingIsOverdue = false;
        const pendingBillsList: any[] = [];

        Object.keys(groups).forEach(key => {
          const group = groups[key];
          const netPending = Math.max(0, group.pending - group.paid);
          if (netPending > 0) {
            existingBillsTotal += netPending;
            const firstBill = group.bills.find(b => b.status !== 'pago') || group.bills[0];
            const contract = activeContracts.find(c => c.property_id === firstBill.property_id);
            
            if (isBillOverdue(firstBill, contract?.due_day || t.due_day || 5)) {
              existingIsOverdue = true;
            }

            pendingBillsList.push({
              ...firstBill,
              total_value: netPending,
              calculated_value: netPending
            });
          }
        });

        let projectedTotal = 0;
        let projectedItems: any[] = [];

        // Apenas projeta aluguel futuro se o inquilino estiver ATIVO
        if (t.status === 'ativo') {
          activeContracts.forEach((contract: any) => {
            // Projeta o aluguel restante desde o dia 1º do mês atual
            const rentBills = tenantBills.filter(b => 
              b.property_id === contract.property_id &&
              (b.type === 'aluguel' || b.type === 'receita') && 
              b.month === currentMonth && 
              b.year === currentYear
            );
            const totalRentLaunched = rentBills.reduce((acc: number, b: any) => acc + Number(b.total_value || b.calculated_value || 0), 0);
            const remainingRent = Math.max(0, Number(contract.rent_value || 0) - totalRentLaunched);

            if (remainingRent > 0) {
              projectedTotal += remainingRent;
              projectedItems.push({ type: 'Aluguel Restante (Projetado)', value: remainingRent });
            }

            // Projeta o condomínio restante desde o dia 1º do mês atual
            const condoBills = tenantBills.filter(b => 
              b.property_id === contract.property_id &&
              b.type === 'condominio' && 
              b.month === currentMonth && 
              b.year === currentYear
            );
            const totalCondoLaunched = condoBills.reduce((acc: number, b: any) => acc + Number(b.total_value || b.calculated_value || 0), 0);
            const condoFee = Number(contract.properties?.condo_fee || 0);
            const remainingCondo = Math.max(0, condoFee - totalCondoLaunched);

            if (remainingCondo > 0) {
              projectedTotal += remainingCondo;
              projectedItems.push({ type: 'Condomínio Restante (Projetado)', value: remainingCondo });
            }
          });
        }
        
        const totalDebt = existingBillsTotal + projectedTotal;
        
        // ATENÇÃO: O status de atrasado (hasOverdue) deve vir APENAS de faturas reais do banco de dados!
        const hasOverdue = existingIsOverdue;

        // Calcular dias de atraso apenas para faturas reais atrasadas
        let maxDaysOverdue = 0;
        const todayMidnight = new Date(currentYear, new Date().getMonth(), currentDay);

        pendingBillsList.forEach(b => {
          const contract = activeContracts.find(c => c.property_id === b.property_id);
          const dueDay = contract?.due_day || t.due_day || 5;
          if (isBillOverdue(b, dueDay)) {
            const dueDateMidnight = new Date(Number(b.year), Number(b.month) - 1, dueDay);
            const diffTime = todayMidnight.getTime() - dueDateMidnight.getTime();
            const days = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
            if (days > maxDaysOverdue) maxDaysOverdue = days;
          }
        });

        return {
          ...t,
          totalDebt,
          pendingCount: pendingBillsList.length + projectedItems.length,
          hasOverdue,
          daysOverdue: maxDaysOverdue,
          bills: tenantBills,
          activeContracts,
          breakdown: {
            projectedItems,
            pendingBills: pendingBillsList
          }
        };
      });

      // Filtramos para mostrar inquilinos ativos OU ex-inquilinos que possuam dívida ativa
      return processed
        .filter(t => t.status === 'ativo' || (t.status === 'encerrado' && t.totalDebt > 0))
        .sort((a, b) => b.totalDebt - a.totalDebt);
    }
  });

  const handleCollect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedTenantId(id);
    setIsModalOpen(true);
  };

  const handleOpenPayment = (e: React.MouseEvent, tenant: any) => {
    e.stopPropagation();
    setSelectedTenantForPayment(tenant);
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
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
        {tenantDebts.map((tenant) => {
          const defaultDueDay = tenant.activeContracts?.[0]?.due_day || tenant.due_day || 5;
          
          return (
            <Card 
              key={tenant.id} 
              className={cn(
                "border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group cursor-pointer",
                tenant.hasOverdue ? "bg-rose-50/50 ring-1 ring-rose-100" : "bg-white"
              )}
              onClick={() => navigate(`/tenants/${tenant.id}`)}
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Avatar className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm group-hover:border-blue-200 transition-all">
                    <AvatarImage src={getTenantAvatar(tenant.name)} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{tenant.name}</h3>
                      {tenant.status === 'encerrado' && (
                        <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase px-2 py-0.5 rounded">
                          Ex-Inquilino
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-500" /> 
                        {tenant.activeContracts?.length > 1 
                          ? `${tenant.activeContracts.length} Contratos Ativos` 
                          : (tenant.properties?.name || 'Sem imóvel')}
                      </p>
                      
                      {tenant.totalDebt > 0 && (
                        <>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          {tenant.hasOverdue ? (
                            <p className="text-xs text-rose-600 font-black uppercase tracking-widest flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Vencido há {tenant.daysOverdue} {tenant.daysOverdue === 1 ? 'dia' : 'dias'}
                            </p>
                          ) : (
                            <p className="text-xs text-blue-600 font-black uppercase tracking-widest">
                              Vence dia {defaultDueDay}
                            </p>
                          )}
                        </>
                      )}
                    </div>
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
                            
                            {tenant.breakdown.projectedItems.map((item: any, i: number) => (
                              <div key={`proj-${i}`} className="flex justify-between gap-8 text-xs">
                                <span>{item.type}:</span>
                                <span className="font-bold text-amber-400">R$ {Number(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}

                            {tenant.breakdown.pendingBills.map((b: any, i: number) => (
                              <div key={`bill-${i}`} className="flex justify-between gap-8 text-xs">
                                <span className="capitalize">{b.type} ({b.month}/{b.year}):</span>
                                <span className="font-bold">R$ {Number(b.total_value || b.calculated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}

                            {tenant.totalDebt === 0 && (
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
                    {tenant.totalDebt > 0 ? (
                      <Button 
                        onClick={(e) => handleOpenPayment(e, tenant)}
                        className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Dar Baixa
                      </Button>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase">
                        Tudo Pago
                      </Badge>
                    )}
                    <Button 
                      onClick={(e) => handleCollect(e, tenant.id)}
                      variant="outline"
                      className={cn(
                        "h-12 px-6 rounded-2xl font-black gap-2 transition-all active:scale-95",
                        tenant.totalDebt > 0 
                          ? "border-blue-200 text-blue-600 hover:bg-blue-50" 
                          : "bg-slate-100 text-slate-400 border-none"
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
          );
        })}
      </TooltipProvider>

      <BillingSummaryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['tenant-collection-list'] }); }} 
        tenantId={selectedTenantId}
      />

      <QuickPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => { 
          setIsPaymentModalOpen(false); 
          queryClient.invalidateQueries({ queryKey: ['tenant-collection-list'] }); 
          queryClient.invalidateQueries({ queryKey: ['bills'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v6'] });
          queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] });
        }}
        tenant={selectedTenantForPayment}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant-collection-list'] });
          queryClient.invalidateQueries({ queryKey: ['bills'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v6'] });
          queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] });
        }}
      />
    </div>
  );
};