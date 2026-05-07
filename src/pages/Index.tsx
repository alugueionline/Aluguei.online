"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
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

const cashFlowData = [
  { day: '01', entradas: 4000, saidas: 1200 },
  { day: '05', entradas: 5200, saidas: 1500 },
  { day: '10', entradas: 8500, saidas: 2100 },
  { day: '15', entradas: 9800, saidas: 2800 },
  { day: '20', entradas: 12400, saidas: 3100 },
  { day: '25', entradas: 14200, saidas: 3400 },
  { day: '30', entradas: 15420, saidas: 3150 },
];

const featuredProperties = [
  { id: '1', name: 'Apto 101', address: 'Rua Central, 123', rent: 'R$ 1.200', status: 'alugado', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80' },
  { id: '2', name: 'Casa 02', address: 'Av. das Flores, 45', rent: 'R$ 2.500', status: 'disponivel', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80' },
  { id: '3', name: 'Kitnet A', address: 'Rua 10, 500', rent: 'R$ 850', status: 'alugado', image: 'https://images.unsplash.com/photo-1536376074432-c26412749023?w=400&q=80' },
  { id: '4', name: 'Loja 05', address: 'Centro Comercial', rent: 'R$ 3.800', status: 'disponivel', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Olá, Jonas! 👋
          </h1>
          <p className="text-gray-500 mt-1.5 text-lg">Aqui está o resumo geral da sua gestão hoje.</p>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard 
              label="Receitas do mês" 
              value="R$ 15.420,00" 
              trend="+ 12,5%" 
              trendType="up" 
              icon={<DollarSign className="w-5 h-5" />}
              color="blue"
            />
            <SummaryCard 
              label="Despesas do mês" 
              value="R$ 3.150,00" 
              trend="- 2,4%" 
              trendType="down" 
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
            />
            <SummaryCard 
              label="Lucro líquido" 
              value="R$ 12.270,00" 
              trend="+ 18,7%" 
              trendType="up" 
              icon={<Activity className="w-5 h-5" />}
              color="green"
            />
            <SummaryCard 
              label="A receber" 
              value="R$ 1.850,00" 
              subtext="3 contratos" 
              icon={<Clock className="w-5 h-5" />}
              color="purple"
              showArrow
            />
          </div>

          {/* Cash Flow Chart */}
          <Card className="premium-card p-8 rounded-[2rem]">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Fluxo de Caixa</h3>
                <p className="text-sm text-gray-500 mt-1">Entradas vs Saídas acumuladas</p>
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <Button size="sm" className="bg-[#2563FF] text-white rounded-xl h-9 px-5 text-xs font-bold shadow-sm">Mensal</Button>
                <Button size="sm" variant="ghost" className="text-gray-500 h-9 px-5 text-xs font-bold hover:text-gray-900">Trimestral</Button>
              </div>
            </div>
            <div className="h-[320px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563FF" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    tickFormatter={(v) => `R$ ${v/1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      padding: '12px 16px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="entradas" 
                    stroke="#2563FF" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorEntradas)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saidas" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorSaidas)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Featured Properties Section - Now Smaller and Below Chart */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Meus Imóveis</h3>
              <button 
                onClick={() => navigate('/properties')}
                className="text-xs font-bold text-[#2563FF] hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProperties.map((prop) => (
                <Card key={prop.id} className="premium-card rounded-3xl overflow-hidden group cursor-pointer border-none" onClick={() => navigate(`/properties/${prop.id}`)}>
                  <div className="relative h-28">
                    <img src={prop.image} alt={prop.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "border-none px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-wider",
                        prop.status === 'alugado' ? 'bg-emerald-500 text-white' : 'bg-[#2563FF] text-white'
                      )}>
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
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs font-bold text-gray-900">{prop.rent}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-[#2563FF] transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="premium-card p-7 rounded-[2rem]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
                <AlertCircle className="w-5 h-5 text-[#2563FF]" />
                Avisos e Pendências
              </h3>
            </div>
            <div className="space-y-5">
              <AlertItem 
                title="Contrato a vencer" 
                desc="João Silva • Vence em 30 dias" 
                tag="APTO 101" 
                icon={<FileWarning className="w-4 h-4" />}
                color="orange"
              />
              <AlertItem 
                title="Pagamento em atraso" 
                desc="Pedro Santos • 5 dias" 
                tag="R$ 900,00" 
                icon={<Clock className="w-4 h-4" />}
                color="red"
              />
            </div>
            <Button variant="ghost" className="w-full mt-6 text-[#2563FF] font-bold text-sm hover:bg-blue-50 rounded-xl">
              Ver todos os avisos
            </Button>
          </Card>

          <Card className="premium-card p-7 rounded-[2rem]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-900 tracking-tight">Atividade recente</h3>
            </div>
            <div className="space-y-8">
              <ActivityItem 
                title="João Silva" 
                desc="Pagamento recebido" 
                time="Hoje, 10:24" 
                amount="R$ 1.200,00"
                icon={<DollarSign className="w-4 h-4" />}
                color="green"
              />
              <ActivityItem 
                title="Ordem de serviço" 
                desc="Vazamento - Apto 202" 
                time="Hoje, 09:15" 
                icon={<Wrench className="w-4 h-4" />}
                color="blue"
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryCard = ({ label, value, trend, trendType, subtext, icon, color, showArrow }: any) => (
  <Card className="premium-card p-7 rounded-[2rem] group">
    <div className="flex justify-between items-start mb-6">
      <div className={cn(
        "p-3.5 rounded-2xl text-white shadow-lg",
        color === 'blue' ? 'bg-[#2563FF] shadow-blue-200' : 
        color === 'red' ? 'bg-rose-500 shadow-rose-100' : 
        color === 'green' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-purple-500 shadow-purple-100'
      )}>
        {icon}
      </div>
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />}
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{value}</h3>
    <div className="flex items-center gap-2 mt-4">
      {trend && (
        <span className={cn(
          "text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg",
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        )}>
          {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      )}
      {subtext && <span className="text-xs text-gray-400 font-bold">{subtext}</span>}
    </div>
  </Card>
);

const AlertItem = ({ title, desc, tag, icon, color }: any) => (
  <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 flex items-start gap-4 group cursor-pointer hover:bg-white hover:premium-shadow transition-all duration-300">
    <div className={cn(
      "p-3 rounded-xl shrink-0",
      color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-rose-100 text-rose-600'
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{title}</p>
      <p className="text-xs text-gray-500 mt-1 truncate">{desc}</p>
      <div className="mt-3">
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
          color === 'orange' ? 'bg-blue-50 text-[#2563FF]' : 'bg-rose-50 text-rose-600'
        )}>{tag}</span>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, desc, time, amount, icon, color }: any) => (
  <div className="flex gap-5 group cursor-pointer">
    <div className={cn(
      "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
      color === 'green' ? 'bg-emerald-50 text-emerald-600' : 
      color === 'blue' ? 'bg-blue-50 text-[#2563FF]' : 'bg-orange-50 text-orange-600'
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{title}</p>
        <span className="text-[10px] font-bold text-gray-400 shrink-0">{time}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1 truncate">{desc}</p>
      {amount && <p className="text-sm font-bold text-gray-900 mt-2">{amount}</p>}
    </div>
  </div>
);

export default Index;