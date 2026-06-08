"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QuickPaymentModal } from '@/components/modals/QuickPaymentModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { isBillOverdue } from '@/utils/financial';
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importação dos componentes modulares
import { KpiCards } from '@/components/dashboard/KpiCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PerformanceCard } from '@/components/dashboard/PerformanceCard';
import { OverdueTenantsTable } from '@/components/dashboard/OverdueTenantsTable';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPaymentsTable } from '@/components/dashboard/RecentPaymentsTable';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenantForCollection, setSelectedTenantForCollection] = useState<string | undefined>(undefined);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const isIncomeType = (type: string) => {
    const t = type?.toLowerCase() || '';
    return ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet', 'condominio', 'taxa extra', 'luz', 'taxa', 'multa', 'juros', 'multa_juros'].includes(t);
  };

  // Busca inquilinos ativos e calcula débitos
  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants-dashboard-active'],
    queryFn: async () => {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();
      const currentDay = new Date().getDate();
      
      const { data } = await supabase
        .from('tenants')
        .select(`*, properties(name, condo_fee, base_rent), bills(*), contracts(rent_value, status, property_id, due_day, properties(condo_fee))`)
        .eq('status', 'ativo');

      const processed = (data || []).map(t => {
        let activeContracts = t.contracts?.filter((c: any) => c.status === 'ativo') || [];
        
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

        const tenantBills = t.bills || [];
        
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

        Object.keys(groups).forEach(key => {
          const group = groups[key];
          const netPending = Math.max(0, group.pending - group.paid);
          if (netPending > 0) {
            existingBillsTotal += netPending;
            const firstBill = group.bills.find(b => b.status !== 'pago') || group.bills[0];
            const contract = activeContracts.find(c => c.property_id === firstBill.property_id);
            if (isBillOverdue(firstBill, contract?.due_day || 5)) {
              existingIsOverdue = true;
            }
          }
        });
        
        let projectedTotal = 0;
        let projectedIsOverdue = false;

        activeContracts.forEach((contract: any) => {
          const dueDay = contract.due_day || 5;
          
          const rentBills = t.bills?.filter((b: any) => (b.type === 'aluguel' || b.type === 'receita') && b.month === currentMonth && b.year === currentYear && b.property_id === contract.property_id) || [];
          const totalRentLaunched = rentBills.reduce((acc: number, b: any) => acc + Number(b.total_value || b.calculated_value || 0), 0);
          const remainingRent = Math.max(0, Number(contract.rent_value || 0) - totalRentLaunched);

          if (remainingRent > 0) {
            projectedTotal += remainingRent;
            if (currentDay >= dueDay) projectedIsOverdue = true;
          }
          
          const condoBills = t.bills?.filter((b: any) => b.type === 'condominio' && b.month === currentMonth && b.year === currentYear && b.property_id === contract.property_id) || [];
          const totalCondoLaunched = condoBills.reduce((acc: number, b: any) => acc + Number(b.total_value || b.calculated_value || 0), 0);
          const condoFee = Number(contract.properties?.condo_fee || 0);
          const remainingCondo = Math.max(0, condoFee - totalCondoLaunched);

          if (remainingCondo > 0) {
            projectedTotal += remainingCondo;
            if (currentDay >= dueDay) projectedIsOverdue = true;
          }
        });

        const totalDebt = existingBillsTotal + projectedTotal;
        const hasOverdue = existingIsOverdue || projectedIsOverdue;

        let status: 'atrasado' | 'pendente' | 'pago' = 'pendente';
        if (totalDebt === 0) status = 'pago';
        else if (hasOverdue) status = 'atrasado';

        return { ...t, totalDebt, hasOverdue, dashboardStatus: status, activeContracts };
      });

      return processed.sort((a, b) => {
        const order = { atrasado: 0, pendente: 1, pago: 2 };
        return order[a.dashboardStatus] - order[b.dashboardStatus];
      });
    }
  });

  // Busca estatísticas financeiras e histórico de 12 meses
  const { data: financialData, isLoading: loadingBills } = useQuery({
    queryKey: ['dashboard-stats-v12'],
    queryFn: async () => {
      const [billsRes, contractsRes, tenantsRes] = await Promise.all([
        supabase.from('bills').select('*'), 
        supabase.from('contracts').select('*, properties(condo_fee, base_rent)').eq('status', 'ativo'),
        supabase.from('tenants').select('*, properties(name)')
      ]);
      
      const bills = billsRes.data || [];
      const contracts = contractsRes.data || [];
      const allTenants = tenantsRes.data || [];
      
      let rec = 0, des = 0, pen = 0, atr = 0;
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();
      const currentDay = new Date().getDate();

      const groups: Record<string, { paid: number, pending: number, bills: any[] }> = {};
      bills.forEach(b => {
        const key = `${b.tenant_id || 'none'}-${b.property_id || 'none'}-${b.type}-${b.month}-${b.year}`;
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

      Object.keys(groups).forEach(key => {
        const group = groups[key];
        const firstBill = group.bills[0];
        const isIncome = isIncomeType(firstBill.type);

        if (isIncome) {
          rec += group.paid;
          const netPending = Math.max(0, group.pending - group.paid);
          if (netPending > 0) {
            const contract = contracts.find(c => c.tenant_id === firstBill.tenant_id && c.property_id === firstBill.property_id);
            if (isBillOverdue(firstBill, contract?.due_day || 5)) {
              atr += netPending;
            } else {
              pen += netPending;
            }
          }
        } else {
          des += group.paid;
        }
      });

      contracts.forEach(c => {
        const dueDay = c.due_day || 5;
        const isOverdue = currentDay >= dueDay;

        const rentBills = bills.filter(b => b.tenant_id === c.tenant_id && b.property_id === c.property_id && (b.type === 'aluguel' || b.type === 'receita') && b.month === currentMonth && b.year === currentYear);
        const totalRentLaunched = rentBills.reduce((acc, b) => acc + Number(b.total_value || b.calculated_value || 0), 0);
        const remainingRent = Math.max(0, Number(c.rent_value || 0) - totalRentLaunched);
        if (remainingRent > 0) {
          if (isOverdue) atr += remainingRent; else pen += remainingRent;
        }

        const condoFee = Number(c.properties?.condo_fee || 0);
        const hasCondoBill = bills.some(b => b.tenant_id === c.tenant_id && b.property_id === c.property_id && b.type === 'condominio' && b.month === currentMonth && b.year === currentYear);
        if (condoFee > 0 && !hasCondoBill) {
          if (isOverdue) atr += condoFee; else pen += condoFee;
        }
      });

      const totalExpected = rec + pen + atr;

      // Cálculo do histórico dos últimos 12 meses com comparação numérica robusta
      const now = new Date();
      const last12Months = Array.from({ length: 12 }).map((_, i) => {
        const date = subMonths(now, i);
        return {
          monthName: format(date, 'MMM', { locale: ptBR }),
          monthNum: format(date, 'MM'),
          year: format(date, 'yyyy'),
          value: 0
        };
      }).reverse();

      last12Months.forEach(monthData => {
        const monthBills = bills.filter(b => {
          const isIncome = isIncomeType(b.type);
          const isPaid = b.status === 'pago';
          
          if (b.payment_date) {
            const pDate = parseISO(b.payment_date);
            return isIncome && isPaid && 
                   (pDate.getMonth() + 1) === Number(monthData.monthNum) && 
                   pDate.getFullYear() === Number(monthData.year);
          }
          
          return isIncome && isPaid && 
                 Number(b.month) === Number(monthData.monthNum) && 
                 Number(b.year) === Number(monthData.year);
        });

        monthData.value = monthBills.reduce((acc, curr) => acc + Number(curr.total_value || curr.calculated_value || 0), 0);
      });

      const revenueHistory = last12Months.map(m => ({ month: m.monthName, value: m.value }));

      // Recebimentos recentes (últimas faturas pagas) com nomes reais dos inquilinos
      const recentPayments = bills
        .filter(b => isIncomeType(b.type) && b.status === 'pago')
        .sort((a, b) => {
          const dateA = a.payment_date ? new Date(a.payment_date).getTime() : 0;
          const dateB = b.payment_date ? new Date(b.payment_date).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(b => {
          const tenant = allTenants.find(t => t.id === b.tenant_id);
          return {
            id: b.id,
            date: b.payment_date ? format(parseISO(b.payment_date), 'dd/MM/yyyy') : 'Recente',
            tenantName: tenant?.name || 'Inquilino',
            property: tenant?.properties?.name || 'Imóvel',
            value: Number(b.total_value || b.calculated_value || 0),
            status: 'pago'
          };
        });

      return { 
        stats: { receitas: rec, despesas: des, lucro: rec - des, pendente: pen, atrasado: atr, totalExpected }, 
        revenueHistory,
        recentPayments
      };
    }
  });

  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0, atrasado: 0, totalExpected: 0 };
  const revenueHistory = financialData?.revenueHistory || [];
  const recentPayments = financialData?.recentPayments || [];
  
  // Taxa de recebimento
  const collectionRate = stats.totalExpected > 0 
    ? Math.round((stats.receitas / stats.totalExpected) * 100) 
    : 0;

  // Filtra inquilinos em atraso
  const overdueTenants = useMemo(() => {
    return tenants.filter(t => t.dashboardStatus === 'atrasado' && t.totalDebt > 0);
  }, [tenants]);

  // Calcula dias de atraso para o inquilino (baseado na fatura mais antiga)
  const getDaysOverdue = (tenant: any) => {
    const dueDay = tenant.activeContracts?.[0]?.due_day || 5;
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const overdueBills = tenant.bills?.filter((b: any) => b.status !== 'pago' && isBillOverdue(b, dueDay)) || [];
    if (overdueBills.length === 0) return 0;
    
    let maxDays = 0;
    overdueBills.forEach((b: any) => {
      const dueDateMidnight = new Date(Number(b.year), Number(b.month) - 1, dueDay);
      const diffTime = todayMidnight.getTime() - dueDateMidnight.getTime();
      const days = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      if (days > maxDays) maxDays = days;
    });
    return maxDays;
  };

  if (loadingBills || loadingTenants) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">Sincronizando dados...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Indicadores Financeiros do Topo */}
      <KpiCards 
        receitas={stats.receitas} 
        pendente={stats.pendente} 
        atrasado={stats.atrasado} 
        collectionRate={collectionRate} 
      />

      {/* Gráfico de Evolução + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <RevenueChart data={revenueHistory} />
        <PerformanceCard 
          receitas={stats.receitas} 
          pendente={stats.pendente} 
          atrasado={stats.atrasado} 
          collectionRate={collectionRate} 
        />
      </div>

      {/* Inquilinos em Atraso + Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <OverdueTenantsTable 
          tenants={overdueTenants} 
          getDaysOverdue={getDaysOverdue} 
          onCobrarClick={(id) => { setSelectedTenantForCollection(id); setIsCollectionModalOpen(true); }}
          onOpenCentral={() => navigate('/financial')}
        />
        <QuickActions onNavigate={navigate} />
      </div>

      {/* Recebimentos Recentes */}
      <RecentPaymentsTable payments={recentPayments} />

      {/* Modais de Ação */}
      <QuickPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        tenant={selectedTenantForPayment} 
        onSuccess={() => { 
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v12'] }); 
          queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] }); 
          queryClient.invalidateQueries({ queryKey: ['tenant-collection-list'] });
          queryClient.invalidateQueries({ queryKey: ['bills'] });
        }} 
      />
      <BillingSummaryModal 
        isOpen={isCollectionModalOpen} 
        onClose={() => setIsCollectionModalOpen(false)} 
        tenantId={selectedTenantForCollection} 
      />
    </DashboardLayout>
  );
};

export default Dashboard;