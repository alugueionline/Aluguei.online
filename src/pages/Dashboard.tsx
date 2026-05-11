"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  Clock,
  ChevronRight,
  AlertCircle,
  Activity,
  MapPin,
  CheckCircle2,
  Loader2,
  Users,
  Home,
  ArrowUpRight,
  TrendingDown,
  Wallet,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const navigate = useNavigate();

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
      const { data } = await supabase.from('properties').select('*').limit(3);
      return data || [];
    }
  });

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants-preview'],
    queryFn: async () => {
      const { data } = await supabase.from('tenants').select('*, properties(name)').limit(5);
      return data || [];
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
      
      let rec = 0, des = 0, pen = 0;
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
        } else {
          if (isIncome) pen += val;
        }
      });

      contracts.forEach(c => {
        const rentVal = Number(c.rent_value || 0);
        const hasBillThisMonth = bills.some(b => 
          b.property_id === c.property_id && 
          b.type === 'aluguel' && 
          b.month === currentMonth &&
          b.year === currentYear
        );

        if (!hasBillThisMonth) {
          pen += rentVal;
        }
      });

      // Mock chart data based on real stats
      const chartData = [
        { name: 'Jan', value: rec * 0.8 },
        { name: 'Fev', value: rec * 0.85 },
        { name: 'Mar', value: rec * 0.9 },
        { name: 'Abr', value: rec * 0.95 },
        { name: 'Mai', value: rec },
      ];

      return { 
        stats: { 
          receitas: rec, 
          despesas: des, 
          lucro: rec - des, 
          pendente: pen 
        },
        chartData
      };
    }
  });

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0 };
  const chartData = financialData?.chartData || [];

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Bem-vindo de volta, {userName}. Aqui está o panorama da sua gestão.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => navigate('/financial')} variant="outline" className="rounded-xl h-11 px-5 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 md:flex-none">
            Financeiro
          </Button>
          <Button onClick={() => navigate('/properties')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-lg gap-2 flex-1 md:flex-none">
            <Plus className="w-4 h-4" /> Novo Imóvel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        <KPIContainer 
          label="Receita Mensal" 
          value={`R$ ${stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<TrendingUp className="w-4 h-4" />} 
          color="blue"
          trend="+12.5%"
        />
        <KPIContainer 
          label="Despesas" 
          value={`R$ ${stats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<TrendingDown className="w-4 h-4" />} 
          color="rose"
          trend="-2.4%"
        />
        <KPIContainer 
          label="Lucro Líquido" 
          value={`R$ ${stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<Wallet className="w-4 h-4" />} 
          color="emerald"
          trend="+8.1%"
        />
        <KPIContainer 
          label="Inadimplência" 
          value={`R$ ${stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<Clock className="w-4 h-4" />} 
          color="amber"
          trend="Crítico"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Gráfico de Evolução */}
          <Card className="premium-card rounded-[1.5rem] p-6">
            <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Evolução de Receita</CardTitle>
                <p className="text-xs text-slate-400 font-medium">Performance dos últimos 5 meses</p>
              </div>
              <Badge variant="outline" className="rounded-lg border-slate-100 text-slate-500 font-bold">Mensal</Badge>
            </CardHeader>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                    tickFormatter={(v) => `R$ ${v/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                    itemStyle={{ fontWeight: 700, color: '#0f172a' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Imóveis em Destaque */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Portfólio de Imóveis</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/properties')} className="text-xs font-bold text-blue-600 hover:bg-blue-50">
                Ver todos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map((prop) => (
                <Card key={prop.id} className="premium-card rounded-2xl overflow-hidden group cursor-pointer" onClick={() => navigate(`/properties/${prop.id}`)}>
                  <div className="relative h-32 bg-slate-100">
                    {prop.image_url ? (
                      <img src={prop.image_url} alt={prop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "border-none px-2 py-0.5 rounded-lg font-black text-[8px] uppercase shadow-sm",
                        prop.status === 'alugado' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                      )}>
                        {prop.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm truncate tracking-tight">{prop.name}</h4>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1 font-semibold">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{prop.address}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Inquilinos Recentes */}
          <Card className="premium-card rounded-[1.5rem] p-6">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-lg font-black tracking-tight">Inquilinos</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Últimas movimentações</p>
            </CardHeader>
            <div className="space-y-4">
              {tenants.map((t) => (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
                  onClick={() => navigate(`/tenants/${t.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 rounded-lg border border-slate-100 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                        {t.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate uppercase">{t.properties?.name || 'Sem imóvel'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl border-slate-100 text-slate-500 font-bold text-xs h-10" onClick={() => navigate('/tenants')}>
                Ver todos os inquilinos
              </Button>
            </div>
          </Card>

          {/* Alertas e Avisos */}
          <Card className="premium-card rounded-[1.5rem] p-6 bg-slate-900 text-white border-none">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-black tracking-tight">Avisos Críticos</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Financeiro</p>
                <p className="text-sm font-medium text-slate-300">Você tem {stats.pendente > 0 ? 'cobranças pendentes' : 'tudo em dia'} para este mês.</p>
              </div>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black text-xs h-10" onClick={() => navigate('/alerts')}>
                Ver Central de Avisos
              </Button>
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
          'bg-amber-50 text-amber-600'
        )}>
          {icon}
        </div>
        <Badge className={cn(
          "border-none text-[10px] font-black px-2 py-0.5 rounded-lg",
          trend === 'Crítico' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
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
      'bg-amber-600'
    )} />
  </Card>
);

export default Dashboard;