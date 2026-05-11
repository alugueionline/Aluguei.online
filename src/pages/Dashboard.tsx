"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingDown, 
  Clock,
  ChevronRight,
  AlertCircle,
  Activity,
  MapPin,
  CheckCircle2,
  Loader2,
  Users,
  Home,
  User
} from 'lucide-react';
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
      const { data } = await supabase.from('properties').select('*').limit(4);
      return data || [];
    }
  });

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants-preview'],
    queryFn: async () => {
      const { data } = await supabase.from('tenants').select('*, properties(name)').limit(4);
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

      return { 
        stats: { 
          receitas: rec, 
          despesas: des, 
          lucro: rec - des, 
          pendente: pen 
        }
      };
    }
  });

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0 };

  if (loadingProps || loadingBills || loadingTenants) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Sincronizando seu workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Olá, {userName}! 👋</h1>
          <p className="text-gray-500 mt-1.5 text-lg font-medium">Aqui está o resumo da sua gestão imobiliária.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => navigate('/tenants')} variant="outline" className="rounded-2xl h-12 px-6 font-bold border-blue-100 text-blue-600 hover:bg-blue-50 flex-1 md:flex-none">
            Novo Inquilino
          </Button>
          <Button onClick={() => navigate('/properties')} className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-12 px-6 font-black shadow-lg gap-2 flex-1 md:flex-none">
            Novo Imóvel <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-10">
          {/* Cards Financeiros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard label="Receitas (Pago)" value={`R$ ${stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} color="blue" />
            <SummaryCard label="Despesas (Pago)" value={`R$ ${stats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingDown className="w-5 h-5" />} color="red" />
            <SummaryCard label="Lucro líquido" value={`R$ ${stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Activity className="w-5 h-5" />} color="green" />
            <SummaryCard label="A receber" value={`R$ ${stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Clock className="w-5 h-5" />} color="purple" />
          </div>

          {/* Seção de Inquilinos (Agora Primeiro) */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Inquilinos Recentes
              </h3>
              <button onClick={() => navigate('/tenants')} className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Ver todos</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {tenants.length > 0 ? tenants.map((t) => (
                <Card key={t.id} className="premium-card p-5 rounded-[2rem] border-none cursor-pointer group hover:bg-blue-50/30 transition-all" onClick={() => navigate(`/tenants/${t.id}`)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} />
                      <AvatarFallback>{t.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{t.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold truncate uppercase">{t.properties?.name || 'Sem imóvel'}</p>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="col-span-4 py-10 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">Nenhum inquilino cadastrado.</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção de Imóveis */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" /> Meus Imóveis
              </h3>
              <button onClick={() => navigate('/properties')} className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Ver todos</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {properties.length > 0 ? properties.map((prop) => (
                <Card key={prop.id} className="premium-card rounded-[2rem] overflow-hidden border-none cursor-pointer group" onClick={() => navigate(`/properties/${prop.id}`)}>
                  <div className="relative h-28 bg-slate-100">
                    {prop.image_url && <img src={prop.image_url} alt={prop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                    <div className="absolute top-2 right-2">
                      <Badge className={cn("border-none px-2 py-0.5 rounded-lg font-black text-[8px] uppercase", prop.status === 'alugado' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white')}>
                        {prop.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-black text-gray-900 text-sm truncate tracking-tight">{prop.name}</h4>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-1 font-bold">
                      <MapPin className="w-2.5 h-2.5 text-blue-600" />
                      <span className="truncate">{prop.address}</span>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="col-span-4 py-10 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">Nenhum imóvel cadastrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="premium-card p-8 rounded-[2.5rem]">
            <h3 className="font-black text-gray-900 flex items-center gap-2.5 tracking-tight mb-8">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Avisos
            </h3>
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Tudo em dia!</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryCard = ({ label, value, icon, color }: any) => (
  <Card className="premium-card p-8 rounded-[2.5rem] border-none">
    <div className={cn(
      "w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg",
      color === 'blue' ? 'bg-blue-600 shadow-blue-100' : 
      color === 'red' ? 'bg-rose-500 shadow-rose-100' : 
      color === 'green' ? 'bg-emerald-500 shadow-emerald-100' : 
      'bg-purple-500 shadow-purple-100'
    )}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">{value}</h3>
  </Card>
);

export default Dashboard;