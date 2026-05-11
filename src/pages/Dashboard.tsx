"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DollarSign, 
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Home,
  Wallet,
  Plus,
  MessageSquare,
  TrendingUp,
  Check,
  PartyPopper,
  ArrowRight
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
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['properties-preview'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*').limit(4);
      return data || [];
    }
  });

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants-dashboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tenants')
        .select('*, properties(name), bills(*)')
        .eq('status', 'ativo');
      return data || [];
    }
  });

  // Mutação para dar baixa no aluguel
  const markAsPaidMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('bills')
        .update({ status: 'pago', payment_date: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .eq('type', 'aluguel');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tenants-dashboard'] });
      toast.success("Pagamento confirmado! O caixa foi atualizado.", {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        className: "premium-card border-emerald-100"
      });
    },
    onError: () => {
      toast.error("Erro ao processar baixa. Tente novamente.");
    }
  });

  const { data: financialData, isLoading: loadingBills } = useQuery({
    queryKey: ['dashboard-stats'],
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

      const incomeTypes = ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet'];

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
          b.type === 'aluguel' && 
          b.month === currentMonth &&
          b.year === currentYear
        );

        if (!hasBillThisMonth) {
          pen += rentVal;
        }
      });

      const totalExpected = rec + pen + atr;
      const collectionData = [
        { name: 'Recebido', value: rec, color: '#10b981' },
        { name: 'Pendente', value: pen, color: '#3b82f6' },
        { name: 'Atrasado', value: atr, color: '#f43f5e' },
      ];

      return { 
        stats: { receitas: rec, despesas: des, lucro: rec - des, pendente: pen + atr, totalExpected },
        collectionData
      };
    }
  });

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0, totalExpected: 0 };
  const collectionData = financialData?.collectionData || [];
  const isAllPaid = stats.totalExpected > 0 && stats.receitas === stats.totalExpected;

  if (loadingProps || loadingBills || loadingTenants) {
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Ativos</h1>
          <p className="text-slate-500 mt-1 font-medium">Olá, {userName}. Veja o status de recebimento dos seus inquilinos.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => navigate('/financial')} variant="outline" className="rounded-xl h-11 px-5 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 md:flex-none">
            Financeiro
          </Button>
          <Button onClick={() => navigate('/tenants')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-lg gap-2 flex-1 md:flex-none">
            <Users className="w-4 h-4" /> Gerenciar Inquilinos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KPIContainer 
          label="Total Previsto (Mês)" 
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
          label="Pendente / Atrasado" 
          value={`R$ ${stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<Clock className="w-4 h-4" />} 
          color="amber"
          trend={stats.pendente > 0 ? "Ação necessária" : "Tudo em dia"}
        />
        <KPIContainer 
          label="Lucro Líquido" 
          value={`R$ ${stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<Wallet className="w-4 h-4" />} 
          color="indigo"
          trend="Caixa Real"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <Card className="premium-card rounded-[2rem] overflow-hidden border-none">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Status de Recebimento</CardTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mês de {new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
              </div>
              {isAllPaid && (
                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full font-black text-[10px] uppercase animate-bounce">
                  100% Coletado
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-4 h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={collectionData}
                        innerRadius={60}
                        outerRadius={80}
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
                    <p className="text-[10px] font-black text-slate-400 uppercase">Recebido</p>
                    <p className="text-xl font-black text-emerald-600">
                      {((stats.receitas / (stats.totalExpected || 1)) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                
                <div className="md:col-span-8 space-y-6">
                  {collectionData.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">
                          R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000" 
                          style={{ 
                            width: `${(item.value / (stats.totalExpected || 1)) * 100}%`,
                            backgroundColor: item.color 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Inquilinos e Pagamentos</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tenants')} className="text-xs font-bold text-blue-600">
                Ver todos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {tenants.slice(0, 5).map((t) => {
                const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
                const currentYear = new Date().getFullYear();
                
                // Cálculo da dívida real (soma de todas as faturas não pagas)
                const totalDebt = t.bills?.filter((b: any) => b.status !== 'pago')
                  .reduce((acc: number, b: any) => acc + Number(b.calculated_value || b.total_value || 0), 0) || 0;
                
                const hasOverdue = t.bills?.some((b: any) => b.status === 'atrasado');
                
                const billThisMonth = t.bills?.find((b: any) => 
                  b.month === currentMonth && b.year === currentYear && b.type === 'aluguel'
                );
                const isPaid = billThisMonth?.status === 'pago';

                return (
                  <Card 
                    key={t.id} 
                    className={cn(
                      "premium-card rounded-2xl p-5 group transition-all",
                      isPaid ? "bg-slate-50/50 border-slate-100" : "hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12 rounded-xl border-2 border-white shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} />
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                              {t.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isPaid && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight">{t.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Home className="w-3 h-3" /> {t.properties?.name || 'Sem imóvel'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block mr-4">
                          <p className="text-[10px] text-slate-400 font-black uppercase">Dívida Real</p>
                          <p className={cn(
                            "text-sm font-black",
                            totalDebt > 0 ? (hasOverdue ? "text-rose-600" : "text-amber-600") : "text-emerald-600"
                          )}>
                            R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        
                        {!isPaid ? (
                          <Button 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase px-4 h-9 gap-2 shadow-lg shadow-emerald-100"
                            onClick={() => markAsPaidMutation.mutate(t.id)}
                            disabled={markAsPaidMutation.isPending}
                          >
                            {markAsPaidMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Dar Baixa
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1.5 rounded-xl font-black text-[10px] uppercase">
                            Pago
                          </Badge>
                        )}
                        
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-blue-600" onClick={() => navigate(`/tenants/${t.id}`)}>
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          {/* Card de Alerta Dinâmico */}
          <Card className={cn(
            "premium-card rounded-[2rem] p-8 border-none relative overflow-hidden transition-all duration-500",
            isAllPaid ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
          )}>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "p-2.5 rounded-xl shadow-lg",
                  isAllPaid ? "bg-white text-emerald-600" : "bg-blue-600 text-white"
                )}>
                  {isAllPaid ? <PartyPopper className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-black tracking-tight">
                  {isAllPaid ? "Tudo em Dia!" : "Ações Urgentes"}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className={cn(
                  "p-5 rounded-2xl border transition-colors",
                  isAllPaid ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"
                )}>
                  {isAllPaid ? (
                    <p className="text-sm font-medium text-emerald-50">
                      Parabéns! Todos os aluguéis deste mês foram recebidos com sucesso.
                    </p>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Inadimplência</p>
                      <p className="text-sm font-medium text-slate-300">
                        Existem R$ {stats.pendente.toLocaleString('pt-BR')} aguardando recebimento.
                      </p>
                    </>
                  )}
                </div>
                
                {!isAllPaid && (
                  <Button 
                    className="w-full bg-white text-slate-900 hover:bg-blue-50 rounded-xl font-black text-xs h-12 shadow-xl"
                    onClick={() => navigate('/financial')}
                  >
                    Abrir Central de Cobrança
                  </Button>
                )}
              </div>
            </div>
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl",
              isAllPaid ? "bg-white/20" : "bg-blue-600/10"
            )} />
          </Card>

          <Card className="premium-card rounded-[2rem] p-8 border-none">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Meus Imóveis</h3>
              <Button variant="ghost" size="icon" onClick={() => navigate('/properties')} className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-6">
              {properties.map((prop) => (
                <div 
                  key={prop.id} 
                  className="flex items-center gap-4 group cursor-pointer"
                  onClick={() => navigate(`/properties/${prop.id}`)}
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    {prop.image_url ? (
                      <img src={prop.image_url} alt={prop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{prop.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge className={cn(
                        "border-none px-1.5 py-0 rounded-md font-black text-[8px] uppercase",
                        prop.status === 'alugado' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      )}>
                        {prop.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold">R$ {Number(prop.base_rent).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const KPIContainer = ({ label, value, icon, color, trend }: any) => (
  <Card className="premium-card p-6 rounded-[1.5rem] border-none relative overflow-hidden group">
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
          trend === 'Ação necessária' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
        )}>
          {trend}
        </Badge>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
    </div>
    <div className={cn(
      "absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
      color === 'blue' ? 'bg-blue-600' : 
      color === 'rose' ? 'bg-rose-600' : 
      color === 'emerald' ? 'bg-emerald-600' : 
      color === 'indigo' ? 'bg-indigo-600' :
      'bg-amber-600'
    )} />
  </Card>
);

export default Dashboard;