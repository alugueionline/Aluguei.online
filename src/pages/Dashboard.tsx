"use client";

import React, { useState } from 'react';
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
  PartyPopper,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuickPaymentModal } from '@/components/modals/QuickPaymentModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { getTenantAvatar } from '@/utils/avatar';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenantForCollection, setSelectedTenantForCollection] = useState<string | undefined>(undefined);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants-dashboard-active'],
    queryFn: async () => {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      const { data } = await supabase
        .from('tenants')
        .select(`
          *, 
          properties(name, condo_fee), 
          bills(*),
          contracts(rent_value, status, property_id, due_day, properties(condo_fee))
        `)
        .eq('status', 'ativo');

      const processed = (data || []).map(t => {
        const activeContracts = t.contracts?.filter((c: any) => c.status === 'ativo') || [];
        const pendingBills = t.bills?.filter((b: any) => b.status !== 'pago') || [];
        const existingBillsTotal = pendingBills.reduce((acc: number, b: any) => 
          acc + Number(b.calculated_value || b.total_value || 0), 0
        );

        let projectedTotal = 0;
        activeContracts.forEach((contract: any) => {
          const hasRentBill = t.bills?.some((b: any) => 
            b.type === 'aluguel' && b.month === currentMonth && b.year === currentYear && b.property_id === contract.property_id
          );
          if (!hasRentBill) projectedTotal += Number(contract.rent_value || 0);

          const hasCondoBill = t.bills?.some((b: any) => 
            b.type === 'condominio' && b.month === currentMonth && b.year === currentYear && b.property_id === contract.property_id
          );
          const condoFee = Number(contract.properties?.condo_fee || 0);
          if (condoFee > 0 && !hasCondoBill) projectedTotal += condoFee;
        });

        const totalDebt = existingBillsTotal + projectedTotal;
        const hasOverdue = pendingBills.some((b: any) => b.status === 'atrasado');
        
        let status: 'atrasado' | 'pendente' | 'pago' = 'pendente';
        if (totalDebt === 0) status = 'pago';
        else if (hasOverdue) status = 'atrasado';

        return { ...t, totalDebt, hasOverdue, dashboardStatus: status };
      });

      return processed.sort((a, b) => {
        const order = { atrasado: 0, pendente: 1, pago: 2 };
        return order[a.dashboardStatus] - order[b.dashboardStatus];
      });
    }
  });

  const { data: financialData, isLoading: loadingBills } = useQuery({
    queryKey: ['dashboard-stats-v2'],
    queryFn: async () => {
      const [billsRes, contractsRes] = await Promise.all([
        supabase.from('bills').select('*'),
        supabase.from('contracts').select('*').eq('status', 'ativo')
      ]);

      const bills = billsRes.data || [];
      const contracts = contractsRes.data || [];
      
      let rec = 0, des = 0, pen = 0, atr = 0;
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      const incomeTypes = ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet', 'condominio'];

      bills.forEach(b => {
        const val = Number(b.total_value || 0);
        const type = b.type?.toLowerCase();
        const isIncome = incomeTypes.includes(type);

        if (b.status === 'pago') {
          if (isIncome) rec += val;
          else des += val;
        } else if (b.status === 'atrasado') {
          if (isIncome) atr += val;
        } else {
          if (isIncome) pen += val;
        }
      });

      contracts.forEach(c => {
        const rentVal = Number(c.rent_value || 0);
        const hasBillThisMonth = bills.some(b => 
          b.tenant_id === c.tenant_id && 
          b.property_id === c.property_id &&
          b.type === 'aluguel' && 
          b.month === currentMonth && 
          b.year === currentYear
        );
        if (!hasBillThisMonth) pen += rentVal;
      });

      const totalExpected = rec + pen + atr;
      const collectionData = [
        { name: 'Recebido', value: rec, color: '#10b981' },
        { name: 'Pendente', value: pen, color: '#f59e0b' },
        { name: 'Atrasado', value: atr, color: '#f43f5e' },
      ];

      return { 
        stats: { receitas: rec, despesas: des, lucro: rec - des, pendente: pen, atrasado: atr, totalExpected },
        collectionData
      };
    }
  });

  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0, atrasado: 0, totalExpected: 0 };
  const collectionData = financialData?.collectionData || [];
  const isAllPaid = stats.totalExpected > 0 && stats.receitas === stats.totalExpected;

  if (loadingBills || loadingTenants) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Sincronizando inteligência financeira...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Central de Recebimento</h1>
          <p className="text-slate-500 mt-1 font-medium">Gerencie quem deve e quem já pagou em tempo real.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => navigate('/financial')} variant="outline" className="rounded-xl h-11 px-5 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 md:flex-none">
            Ver Extrato
          </Button>
          <Button onClick={() => navigate('/tenants')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-lg gap-2 flex-1 md:flex-none">
            <Users className="w-4 h-4" /> Inquilinos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <KPIContainer 
          label="Total Previsto" 
          value={`R$ ${stats.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<TrendingUp className="w-4 h-4" />} 
          color="blue"
          trend="Expectativa"
        />
        <KPIContainer 
          label="Recebido" 
          value={`R$ ${stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<CheckCircle2 className="w-4 h-4" />} 
          color="emerald"
          trend={`${((stats.receitas / (stats.totalExpected || 1)) * 100).toFixed(0)}% do total`}
        />
        <KPIContainer 
          label="Atrasado" 
          value={`R$ ${stats.atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<AlertTriangle className="w-4 h-4" />} 
          color="rose"
          trend={stats.atrasado > 0 ? "Urgente" : "Nenhum atraso"}
          highlight={stats.atrasado > 0}
        />
        <KPIContainer 
          label="Pendente" 
          value={`R$ ${stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<Clock className="w-4 h-4" />} 
          color="amber"
          trend="A vencer"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
        <div className="xl:col-span-7">
          <Card className="premium-card rounded-[2.5rem] overflow-hidden border-none h-full">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Resumo de Recebimento</CardTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Performance do mês atual</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Taxa de Sucesso</p>
                <p className="text-xl font-black text-emerald-600">
                  {((stats.receitas / (stats.totalExpected || 1)) * 100).toFixed(0)}%
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-12">
              <div className="h-[220px] w-[220px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={collectionData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {collectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <DollarSign className="w-6 h-6 text-slate-200 mb-1" />
                  <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                {collectionData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-5">
          <Card className={cn(
            "premium-card rounded-[2.5rem] p-8 border-none relative overflow-hidden h-full transition-all duration-500",
            isAllPaid ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
          )}>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "p-3 rounded-2xl shadow-lg",
                  isAllPaid ? "bg-white text-emerald-600" : "bg-blue-600 text-white"
                )}>
                  {isAllPaid ? <PartyPopper className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {isAllPaid ? "Tudo em Dia!" : "Ações Urgentes"}
                  </h3>
                  <p className={cn("text-xs font-bold uppercase tracking-widest mt-1", isAllPaid ? "text-emerald-100" : "text-slate-400")}>
                    {isAllPaid ? "Parabéns pela gestão" : "Atenção aos recebimentos"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className={cn(
                  "p-6 rounded-3xl border transition-colors",
                  isAllPaid ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"
                )}>
                  {isAllPaid ? (
                    <p className="text-sm font-medium text-emerald-50 leading-relaxed">
                      Todos os aluguéis e contas deste mês foram recebidos. Seu fluxo de caixa está saudável!
                    </p>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Inadimplência Real</p>
                      <p className="text-2xl font-black text-white">
                        R$ {stats.atrasado.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs font-medium text-slate-400 mt-2">
                        Valor total acumulado em faturas que já venceram.
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {!isAllPaid && (
                <Button 
                  className="w-full bg-white text-slate-900 hover:bg-blue-50 rounded-2xl font-black text-sm h-14 shadow-xl mt-6"
                  onClick={() => navigate('/financial')}
                >
                  Abrir Central de Cobrança <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Status de Pagamento por Inquilino</h3>
          <Badge className="bg-slate-100 text-slate-500 border-none font-bold px-4 py-1.5 rounded-full">
            {tenants.length} Inquilinos Ativos
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {tenants.map((t) => (
            <Card 
              key={t.id} 
              className={cn(
                "premium-card rounded-[2rem] p-6 group transition-all border-none",
                t.dashboardStatus === 'atrasado' ? "bg-rose-50/50 ring-1 ring-rose-100" : 
                t.dashboardStatus === 'pago' ? "bg-white opacity-80" : "bg-white"
              )}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div 
                  className="flex items-center gap-4 cursor-pointer group/tenant w-full md:w-auto"
                  onClick={() => navigate(`/tenants/${t.id}`)}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm group-hover/tenant:border-blue-200 transition-all">
                      <AvatarImage src={getTenantAvatar(t.name)} />
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                        {t.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {t.dashboardStatus === 'pago' && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight group-hover/tenant:text-blue-600 transition-colors">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Home className="w-3 h-3" /> {t.properties?.name || 'Sem imóvel'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase">Dívida Atual</p>
                    <p className={cn(
                      "text-lg font-black",
                      t.dashboardStatus === 'atrasado' ? "text-rose-600" : 
                      t.dashboardStatus === 'pendente' ? "text-amber-600" : "text-emerald-600"
                    )}>
                      R$ {t.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {t.dashboardStatus !== 'pago' ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-11 px-4 rounded-xl border-blue-200 text-blue-600 font-bold gap-2 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedTenantForCollection(t.id);
                            setIsCollectionModalOpen(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" /> Cobrar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black px-5 h-11 gap-2 shadow-lg shadow-emerald-100"
                          onClick={() => {
                            setSelectedTenantForPayment(t);
                            setIsPaymentModalOpen(true);
                          }}
                        >
                          <Check className="w-4 h-4" /> Baixar
                        </Button>
                      </>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase">
                        Tudo Pago
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-blue-600" onClick={() => navigate(`/tenants/${t.id}`)}>
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <QuickPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tenant={selectedTenantForPayment}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v2'] });
          queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] });
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

const KPIContainer = ({ label, value, icon, color, trend, highlight }: any) => (
  <Card className={cn(
    "premium-card p-6 rounded-[1.5rem] border-none relative overflow-hidden group",
    highlight && "ring-2 ring-rose-500 shadow-lg shadow-rose-100"
  )}>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
          color === 'blue' ? 'bg-blue-50 text-blue-600' : 
          color === 'rose' ? 'bg-rose-50 text-rose-600' : 
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
          color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
          'bg-amber-50 text-amber-600'
        )}>
          {icon}
        </div>
        <Badge className={cn(
          "border-none text-[10px] font-black px-2 py-0.5 rounded-lg",
          highlight ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
        )}>
          {trend}
        </Badge>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className={cn(
        "text-xl font-black mt-1 tracking-tight",
        highlight ? "text-rose-600" : "text-slate-900"
      )}>{value}</h3>
    </div>
  </Card>
);

export default Dashboard;