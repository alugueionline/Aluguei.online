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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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

      // Tipos que são considerados Receita (Entradas)
      const incomeTypes = ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet'];

      // 1. Processar faturas existentes no banco
      bills.forEach(b => {
        const val = Number(b.total_value) || 0;
        const type = b.type?.toLowerCase();
        const isIncome = incomeTypes.includes(type);
        const isExpense = type === 'despesa';

        if (b.status === 'pago') {
          if (isIncome) rec += val;
          else if (isExpense) des += val;
          else des += val; // Por segurança, outros tipos não mapeados são despesas
        } else {
          if (isIncome) pen += val;
        }
      });

      // 2. Somar aluguéis de contratos ativos que ainda não geraram fatura este mês (Previsão)
      contracts.forEach(c => {
        const rentVal = Number(c.rent_value) || 0;
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

  if (loadingProps || loadingBills) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Sincronizando dados financeiros...</p>
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
        <Button onClick={() => navigate('/properties')} className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-12 px-6 font-black shadow-lg gap-2 transition-all active:scale-95">
          Novo Imóvel <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard label="Receitas (Pago)" value={`R$ ${stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} color="blue" />
            <SummaryCard label="Despesas (Pago)" value={`R$ ${stats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingDown className="w-5 h-5" />} color="red" />
            <SummaryCard label="Lucro líquido" value={`R$ ${stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Activity className="w-5 h-5" />} color="green" />
            <SummaryCard label="A receber" value={`R$ ${stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Clock className="w-5 h-5" />} color="purple" />
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Meus Imóveis</h3>
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
                  <p className="text-gray-400 font-bold">Nenhum imóvel cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="premium-card p-8 rounded-[2.5rem]">
            <h3 className="font-black text-gray-900 flex items-center gap-2.5 tracking-tight mb-8">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Avisos e Pendências
            </h3>
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Tudo em dia por aqui!</p>
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