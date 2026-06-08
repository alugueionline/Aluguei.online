"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Search,
  Bell,
  Calendar,
  Plus,
  FileText,
  Home,
  UserPlus,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuickPaymentModal } from '@/components/modals/QuickPaymentModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { getTenantAvatar } from '@/utils/avatar';
import { isBillOverdue } from '@/utils/financial';
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

      // Cálculo do histórico dos últimos 12 meses
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
                   format(pDate, 'MM') === monthData.monthNum && 
                   format(pDate, 'yyyy') === monthData.year;
          }
          return isIncome && isPaid && b.month === monthData.monthNum && b.year === monthData.year;
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

  // Dados para o gráfico de rosca (Mix de Recebimento)
  const donutData = useMemo(() => {
    return [
      { name: 'Recebido', value: stats.receitas, color: '#10B981' },
      { name: 'Pendente', value: stats.pendente, color: '#F59E0B' },
      { name: 'Atrasado', value: stats.atrasado, color: '#EF4444' }
    ].filter(d => d.value > 0);
  }, [stats]);

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
      {/* PRIMEIRA LINHA: 4 KPI Cards Horizontais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Recebido */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recebido</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            R$ {stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">vs. mês anterior</p>
        </Card>

        {/* Pendente */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendente</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            R$ {stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">A vencer no período</p>
        </Card>

        {/* Atrasado */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atrasado</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-rose-600 tracking-tight">
            R$ {stats.atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Faturas vencidas</p>
        </Card>

        {/* Taxa de Recebimento */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de Recebimento</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <h3 className="text-xl font-black text-blue-600 tracking-tight">
            {collectionRate}%
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Eficiência de cobrança</p>
        </Card>
      </div>

      {/* SEGUNDA LINHA: Gráfico Principal (70%) + Performance (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Gráfico Principal */}
        <Card className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">Evolução dos Recebimentos</CardTitle>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Histórico de receitas confirmadas nos últimos 12 meses</p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
                    tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', padding: '10px' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Recebido']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563FF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card de Performance */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Performance</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Taxa de adimplência atual</p>
          </div>

          <div className="flex justify-center my-4">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius="75%"
                    outerRadius="95%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{collectionRate}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Recebido</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" /> Recebido
              </div>
              <span className="font-black text-slate-900">R$ {stats.receitas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Pendente
              </div>
              <span className="font-black text-slate-900">R$ {stats.pendente.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Atrasado
              </div>
              <span className="font-black text-slate-900">R$ {stats.atrasado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* TERCEIRA LINHA: Inquilinos em Atraso (Coluna 1) + Ações Rápidas (Coluna 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Inquilinos em Atraso */}
        <Card className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">Inquilinos em atraso</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ações de cobrança necessárias</p>
            </div>
            <Button 
              onClick={() => setIsCollectionModalOpen(true)}
              variant="outline"
              className="h-8 px-3 rounded-lg border-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-50"
            >
              Abrir Central de Cobrança
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imóvel</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dias em atraso</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {overdueTenants.length > 0 ? (
                  overdueTenants.slice(0, 4).map((t) => {
                    const daysOverdue = getDaysOverdue(t);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7 rounded-lg border border-slate-100">
                              <AvatarImage src={getTenantAvatar(t.name)} />
                              <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-[10px]">
                                {t.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-slate-900">{t.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {t.properties?.name || 'Sem imóvel'}
                        </td>
                        <td className="p-4">
                          <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-md">
                            {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs font-black text-slate-900">
                          R$ {t.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-7 px-3 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs"
                            onClick={() => { setSelectedTenantForCollection(t.id); setIsCollectionModalOpen(true); }}
                          >
                            Cobrar
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs font-medium text-slate-400">
                      Nenhum inquilino em atraso no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Ações Rápidas */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Ações rápidas</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Atalhos operacionais</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/contracts')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Novo contrato</span>
            </button>

            <button 
              onClick={() => navigate('/properties')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Novo imóvel</span>
            </button>

            <button 
              onClick={() => navigate('/financial')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Nova cobrança</span>
            </button>

            <button 
              onClick={() => navigate('/tenants')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Cadastrar inquilino</span>
            </button>
          </div>
        </Card>
      </div>

      {/* QUARTA LINHA: Recebimentos Recentes */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Recebimentos recentes</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Últimas transações confirmadas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquilino</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imóvel</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPayments.length > 0 ? (
                recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 text-xs font-medium text-slate-500">{p.date}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 rounded-md border border-slate-100">
                          <AvatarImage src={getTenantAvatar(p.tenantName)} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-[9px] font-bold">
                            {p.tenantName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-900">{p.tenantName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">{p.property}</td>
                    <td className="p-4 text-xs font-black text-slate-900">
                      R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-md">
                        Pago
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs font-medium text-slate-400">
                    Nenhum recebimento recente registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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