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

  // Busca dados do usuário
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Busca imóveis com cache
  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['properties-preview'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*').limit(4);
      return data || [];
    }
  });

  // Busca contas e calcula estatísticas com cache
  const { data: financialData, isLoading: loadingBills } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: bills } = await supabase.from('bills').select('*');
      let rec = 0, des = 0, pen = 0;
      const overdue: any[] = [];

      if (bills) {
        bills.forEach(b => {
          const val = Number(b.total_value || b.calculated_value) || 0;
          if (b.status === 'pago') {
            if (b.type === 'receita' || b.type === 'aluguel') rec += val;
            else des += val;
          } else {
            if (b.type === 'receita' || b.type === 'aluguel') pen += val;
            if (b.due_date && new Date(b.due_date) < new Date()) {
              overdue.push({ id: b.id, title: `Atraso: ${b.description || b.type}`, type: 'error' });
            }
          }
        });
      }
      return { stats: { receitas: rec, despesas: des, lucro: rec - des, pendente: pen }, alerts: overdue };
    }
  });

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  const stats = financialData?.stats || { receitas: 0, despesas: 0, lucro: 0, pendente: 0 };
  const alerts = financialData?.alerts || [];

  if (loadingProps || loadingBills) {
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Olá, {userName}! 👋</h1>
          <p className="text-gray-500 mt-1.5 text-lg">Aqui está o resumo da sua gestão pessoal.</p>
        </div>
        <Button onClick={() => navigate('/properties')} className="bg-[#2563FF] hover:bg-[#1d4ed8] rounded-2xl h-12 px-6 font-bold shadow-lg gap-2">
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
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Meus Imóveis</h3>
              <button onClick={() => navigate('/properties')} className="text-xs font-bold text-[#2563FF] hover:underline">Ver todos</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {properties.length > 0 ? properties.map((prop) => (
                <Card key={prop.id} className="premium-card rounded-3xl overflow-hidden border-none cursor-pointer" onClick={() => navigate(`/properties/${prop.id}`)}>
                  <div className="relative h-28 bg-slate-100">
                    {prop.image_url && <img src={prop.image_url} alt={prop.name} className="w-full h-full object-cover" />}
                    <div className="absolute top-2 right-2">
                      <Badge className={cn("border-none px-2 py-0.5 rounded-md font-bold text-[8px] uppercase", prop.status === 'alugado' ? 'bg-emerald-500 text-white' : 'bg-[#2563FF] text-white')}>
                        {prop.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{prop.name}</h4>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-1">
                      <MapPin className="w-2.5 h-2.5 text-[#2563FF]" />
                      <span className="truncate">{prop.address}</span>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="col-span-4 py-10 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">Nenhum imóvel cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="premium-card p-7 rounded-[2rem]">
            <h3 className="font-bold text-gray-900 flex items-center gap-2.5 tracking-tight mb-8">
              <AlertCircle className="w-5 h-5 text-[#2563FF]" />
              Avisos e Pendências
            </h3>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {alert.title}
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-gray-400 text-xs font-bold">Tudo em dia por aqui!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryCard = ({ label, value, icon, color }: any) => (
  <Card className="premium-card p-7 rounded-[2rem]">
    <div className={cn(
      "w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg",
      color === 'blue' ? 'bg-[#2563FF]' : color === 'red' ? 'bg-rose-500' : color === 'green' ? 'bg-emerald-500' : 'bg-purple-500'
    )}>
      {icon}
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{value}</h3>
  </Card>
);

export default Dashboard;