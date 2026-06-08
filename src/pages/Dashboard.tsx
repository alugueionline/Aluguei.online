"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  DollarSign, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Home,
  MessageSquare,
  TrendingUp,
  Check,
  ArrowRight,
  AlertTriangle,
  CalendarDays,
  Percent,
  ChevronRight,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
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

  // Busca estatísticas financeiras e histórico de 6 meses
  const { data: financialData, isLoading: loadingBills } = useQuery({
    queryKey: ['dashboard-stats-v6'],
    queryFn: async () => {
      const [billsRes, contractsRes] = await Promise.all([
        supabase.from('bills').select('*'), 
        supabase.from('contracts').select('*, properties(condo_fee, base_rent)').eq('status', 'ativo')
      ]);
      
      const bills = billsRes.data || [];
      const contracts = contractsRes.data || [];
      
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

      // Cálculo do histórico dos últimos 6 meses
      const now = new Date();
      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, i);
        return {
          monthName: format(date, 'MMM', { locale: ptBR }),
          monthNum: format(date, 'MM'),
          year: format(date, 'yyyy'),
          value: 0
        };
      }).reverse();

      last6Months.forEach(monthData => {
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

      const revenueHistory = last6Months.map(m => ({ month: m.monthName, value: m.value }));

      return { 
        stats: { receitas: rec, despesas: des, lucro: rec - des, pendente: pen, atrasado: atr, totalExpected }, 
        revenueHistory 
      };
    }
  });

  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0, atrasado: 0, totalExpected: 0 };
  const revenueHistory = financialData?.revenueHistory || [];
  
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Sincronizando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Topo */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Central de Recebimento</h1>
          <p className="text-slate-500 mt-1 font-medium">Gerencie recebimentos, pendências e cobranças em tempo real.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            onClick={() => navigate('/financial')} 
            variant="outline" 
            className="rounded-xl h-11 px-5 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 md:flex-none"
          >
            Ver Extrato
          </Button>
          <Button 
            onClick={() => navigate('/tenants')} 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-lg gap-2 flex-1 md:flex-none"
          >
            <Users className="w-4 h-4" /> Inquilinos
          </Button>
        </div>
      </div>

      {/* Linha 1: 4 Cards de KPI iguais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card Recebido */}
        <Card className="premium-card p-6 rounded-[2rem] border-none bg-white transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recebido</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-slate-900">
              R$ {stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              Valores confirmados em caixa
            </p>
          </div>
        </Card>

        {/* Card Pendente */}
        <Card className="premium-card p-6 rounded-[2rem] border-none bg-white transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendente</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-slate-900">
              R$ {stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              A vencer até o fim do mês
            </p>
          </div>
        </Card>

        {/* Card Atrasado */}
        <Card className="premium-card p-6 rounded-[2rem] border-none bg-white transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atrasado</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-rose-600">
              R$ {stats.atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              Faturas vencidas não pagas
            </p>
          </div>
        </Card>

        {/* Card Taxa de Recebimento */}
        <Card className="premium-card p-6 rounded-[2rem] border-none bg-white transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa de Recebimento</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-blue-600">
              {collectionRate}%
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              Eficiência de cobrança
            </p>
          </div>
        </Card>
      </div>

      {/* Linha 2: Gráfico de Evolução Mensal + Gráfico de Rosca & Total Previsto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Gráfico de Evolução Mensal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-card border-none rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Recebimentos dos últimos 6 meses</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Evolução mensal de receitas confirmadas</p>
            </CardHeader>
            <CardContent className="px-4 pb-8">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} 
                      tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px' }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Recebido']}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#2563FF" 
                      radius={[8, 8, 0, 0]} 
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sub-grid com Total Previsto e Gráfico de Rosca Compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card Total Previsto Compacto */}
            <Card className="relative overflow-hidden rounded-[2rem] border-none bg-slate-900 text-white p-6 shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full -mr-12 -mt-12 blur-2xl" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-none text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Projeção
                  </Badge>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Previsto</p>
                <h3 className="text-xl font-black mt-1 tracking-tight text-white">
                  R$ {stats.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
                  [ Recebido + Pendente + Atrasado ]
                </p>
              </div>
            </Card>

            {/* Gráfico de Rosca Compacto */}
            <Card className="premium-card border-none rounded-[2rem] bg-white p-6 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mix de Recebimento</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" /> Recebido
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Pendente
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Atrasado
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius="65%"
                      outerRadius="90%"
                      paddingAngle={3}
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
                  <span className="text-xs font-black text-slate-900">{collectionRate}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Coluna Direita: Ações Urgentes Compacto e Prático */}
        <div className="lg:col-span-1">
          <Card className="premium-card border-none rounded-[2.5rem] bg-white p-6 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Ações Urgentes</h3>
                  <p className="text-xs text-slate-400 font-medium">Cobranças pendentes de atenção imediata</p>
                </div>
              </div>

              <div className="space-y-3">
                {overdueTenants.length > 0 ? (
                  overdueTenants.slice(0, 3).map((t) => (
                    <div 
                      key={t.id} 
                      className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/30 border border-rose-100/50 hover:bg-rose-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tenants/${t.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-8 h-8 rounded-xl border border-white shadow-sm">
                          <AvatarImage src={getTenantAvatar(t.name)} />
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-xs">
                            {t.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{t.name}</p>
                          <p className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">{getDaysOverdue(t)} dias vencido</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-rose-700 whitespace-nowrap">
                        R$ {t.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-xs font-bold">Nenhuma pendência urgente!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 mt-6">
              <Button 
                onClick={() => setIsCollectionModalOpen(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 font-bold text-xs gap-2 shadow-lg shadow-rose-100"
              >
                <MessageSquare className="w-4 h-4" /> Abrir Central de Cobrança
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Linha 3: Inquilinos em Atraso */}
      <div className="space-y-6">
        <div className="px-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inquilinos em atraso</h3>
          <p className="text-slate-500 text-sm font-medium">Lista de inadimplentes ativos que necessitam de cobrança.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {overdueTenants.length > 0 ? (
            overdueTenants.map((t) => {
              const daysOverdue = getDaysOverdue(t);
              return (
                <Card key={t.id} className="premium-card rounded-[2rem] p-6 border-none bg-rose-50/30 ring-1 ring-rose-100">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 cursor-pointer w-full md:w-auto" onClick={() => navigate(`/tenants/${t.id}`)}>
                      <Avatar className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm">
                        <AvatarImage src={getTenantAvatar(t.name)} />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                          {t.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-black text-slate-900 tracking-tight hover:text-blue-600 transition-colors">{t.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <Home className="w-3 h-3 text-blue-500" /> {t.properties?.name || 'Sem imóvel'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase">Valor em Atraso</p>
                        <p className="text-lg font-black text-rose-600">
                          R$ {t.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase">Tempo de Atraso</p>
                        <Badge className="bg-rose-100 text-rose-700 border-none font-black text-[10px] uppercase mt-1">
                          {daysOverdue} {daysOverdue === 1 ? 'dia vencido' : 'dias vencidos'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-11 px-5 rounded-xl border-blue-200 text-blue-600 font-bold gap-2 hover:bg-blue-50" 
                          onClick={() => { setSelectedTenantForCollection(t.id); setIsCollectionModalOpen(true); }}
                        >
                          <MessageSquare className="w-4 h-4" /> Cobrar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black px-5 h-11 gap-2 shadow-lg shadow-emerald-100" 
                          onClick={() => { setSelectedTenantForPayment(t); setIsPaymentModalOpen(true); }}
                        >
                          <Check className="w-4 h-4" /> Baixar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl text-slate-300 hover:text-blue-600" 
                          onClick={() => navigate(`/tenants/${t.id}`)}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Nenhum inquilino em atraso!</h3>
              <p className="text-slate-400 font-medium mt-1">Excelente! Todos os recebimentos estão em dia.</p>
            </div>
          )}
        </div>
      </div>

      <QuickPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        tenant={selectedTenantForPayment} 
        onSuccess={() => { 
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v6'] }); 
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