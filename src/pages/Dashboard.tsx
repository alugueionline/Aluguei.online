"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingDown, 
  Clock,
  ChevronRight,
  AlertCircle,
  FileWarning,
  Activity,
  Wrench,
  MapPin,
  ArrowUpRight
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

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    receitas: 0,
    despesas: 0,
    lucro: 0,
    pendente: 0
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUserName(user.user_metadata?.full_name?.split(' ')[0] || 'Usuário');

      // Buscar Imóveis
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .limit(4);
      setProperties(props || []);

      // Buscar Resumo Financeiro (Exemplo simplificado)
      const { data: bills } = await supabase
        .from('bills')
        .select('total_value, type, status');
      
      let rec = 0, des = 0, pen = 0;
      bills?.forEach(b => {
        if (b.type === 'receita' || b.type === 'aluguel') {
          if (b.status === 'pago') rec += Number(b.total_value);
          else pen += Number(b.total_value);
        } else {
          if (b.status === 'pago') des += Number(b.total_value);
        }
      });

      setStats({
        receitas: rec,
        despesas: des,
        lucro: rec - des,
        pendente: pen
      });

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  if (loading) return <DashboardLayout>Carregando seu workspace...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Olá, {userName}! 👋
          </h1>
          <p className="text-gray-500 mt-1.5 text-lg">Aqui está o resumo da sua gestão pessoal.</p>
        </div>
        <Button 
          onClick={() => navigate('/properties')}
          className="bg-[#2563FF] hover:bg-[#1d4ed8] rounded-2xl h-12 px-6 font-bold shadow-lg shadow-blue-100 gap-2"
        >
          Novo Imóvel <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard 
              label="Receitas do mês" 
              value={`R$ ${stats.receitas.toLocaleString('pt-BR')}`} 
              icon={<DollarSign className="w-5 h-5" />}
              color="blue"
            />
            <SummaryCard 
              label="Despesas do mês" 
              value={`R$ ${stats.despesas.toLocaleString('pt-BR')}`} 
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
            />
            <SummaryCard 
              label="Lucro líquido" 
              value={`R$ ${stats.lucro.toLocaleString('pt-BR')}`} 
              icon={<Activity className="w-5 h-5" />}
              color="green"
            />
            <SummaryCard 
              label="A receber" 
              value={`R$ ${stats.pendente.toLocaleString('pt-BR')}`} 
              icon={<Clock className="w-5 h-5" />}
              color="purple"
              showArrow
            />
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Meus Imóveis</h3>
              <button onClick={() => navigate('/properties')} className="text-xs font-bold text-[#2563FF] hover:underline">Ver todos</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {properties.length > 0 ? properties.map((prop) => (
                <Card key={prop.id} className="premium-card rounded-3xl overflow-hidden group cursor-pointer border-none" onClick={() => navigate(`/properties/${prop.id}`)}>
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
            <div className="text-center py-4 text-gray-400 text-sm">
              Tudo em dia por aqui!
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryCard = ({ label, value, icon, color, showArrow }: any) => (
  <Card className="premium-card p-7 rounded-[2rem] group">
    <div className="flex justify-between items-start mb-6">
      <div className={cn(
        "p-3.5 rounded-2xl text-white shadow-lg",
        color === 'blue' ? 'bg-[#2563FF]' : 
        color === 'red' ? 'bg-rose-500' : 
        color === 'green' ? 'bg-emerald-500' : 'bg-purple-500'
      )}>
        {icon}
      </div>
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-300" />}
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{value}</h3>
  </Card>
);

export default Index;