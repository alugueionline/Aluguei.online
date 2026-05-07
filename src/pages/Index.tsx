"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  ChevronRight,
  AlertCircle,
  FileWarning,
  Activity,
  Wrench
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
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

const sparklineData = [
  { v: 10 }, { v: 15 }, { v: 8 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Olá, Jonas! 👋
        </h1>
        <p className="text-gray-500 mt-1">Aqui está o resumo geral da sua gestão.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* COLUNA PRINCIPAL (ESQUERDA) */}
        <div className="xl:col-span-3 space-y-8">
          {/* CARDS DE RESUMO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              subtext="3 contratos em aberto" 
              icon={<Clock className="w-5 h-5" />}
              color="purple"
              showArrow
            />
          </div>

          {/* GRÁFICO DE FLUXO DE CAIXA */}
          <Card className="bg-[#161B22] border-none p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Fluxo de Caixa</h3>
                <p className="text-sm text-gray-500">Entradas vs Saídas acumuladas</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-[#0B0E14] p-1 rounded-xl">
                  <Button size="sm" className="bg-blue-600 text-white rounded-lg h-8 px-4 text-xs font-bold">Mensal</Button>
                  <Button size="sm" variant="ghost" className="text-gray-500 h-8 px-4 text-xs font-bold">Trimestral</Button>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-400">Entradas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-400">Saídas</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} tickFormatter={(v) => `R$ ${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="entradas" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" />
                  <Area type="monotone" dataKey="saidas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSaidas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* DESEMPENHO GERAL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MiniStatCard label="Taxa de ocupação" value="94,8%" icon={<Activity className="w-4 h-4" />} color="blue" />
            <MiniStatCard label="Inadimplência" value="2,6%" icon={<AlertCircle className="w-4 h-4" />} color="red" />
            <MiniStatCard label="Ticket médio" value="R$ 1.450" icon={<DollarSign className="w-4 h-4" />} color="green" />
            <MiniStatCard label="Rentabilidade" value="8,7%" icon={<TrendingUp className="w-4 h-4" />} color="purple" />
          </div>
        </div>

        {/* COLUNA LATERAL (DIREITA) */}
        <div className="space-y-6">
          {/* AVISOS E PENDÊNCIAS */}
          <Card className="bg-[#161B22] border-none p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Avisos e Pendências
              </h3>
              <button className="text-xs font-bold text-blue-500 hover:underline">Ver todos</button>
            </div>
            <div className="space-y-4">
              <AlertItem 
                title="Contrato a vencer" 
                desc="João Silva • Vence em 30 dias" 
                tag="APTO 101" 
                icon={<FileWarning className="w-4 h-4" />}
                color="orange"
              />
              <AlertItem 
                title="Pagamento em atraso" 
                desc="Pedro Santos • 5 dias de atraso" 
                tag="R$ 900,00" 
                icon={<Clock className="w-4 h-4" />}
                color="red"
              />
            </div>
          </Card>

          {/* PRÓXIMOS RECEBIMENTOS */}
          <Card className="bg-[#161B22] border-none p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Próximos recebimentos</h3>
              <button className="text-xs font-bold text-blue-500 hover:underline">Ver calendário</button>
            </div>
            <div className="flex justify-between gap-2">
              <UpcomingItem day="Qui" date="16" amount="R$ 1.250" active />
              <UpcomingItem day="Sex" date="17" amount="R$ 1.800" />
              <UpcomingItem day="Sáb" date="18" amount="R$ 950" />
              <UpcomingItem day="Dom" date="19" amount="R$ 2.100" />
            </div>
          </Card>

          {/* ATIVIDADE RECENTE */}
          <Card className="bg-[#161B22] border-none p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Atividade recente</h3>
              <button className="text-xs font-bold text-blue-500 hover:underline">Ver todas</button>
            </div>
            <div className="space-y-6">
              <ActivityItem 
                title="João Silva" 
                desc="Pagamento recebido" 
                time="Hoje, 10:24" 
                amount="R$ 1.200,00"
                icon={<DollarSign className="w-4 h-4" />}
                color="green"
              />
              <ActivityItem 
                title="Ordem de serviço criada" 
                desc="Vazamento no banheiro - Apto 202" 
                time="Hoje, 09:15" 
                icon={<Wrench className="w-4 h-4" />}
                color="blue"
              />
              <ActivityItem 
                title="Novo contrato assinado" 
                desc="Maria Oliveira - Apto 303" 
                time="Ontem, 16:45" 
                icon={<FileWarning className="w-4 h-4" />}
                color="orange"
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// HELPER COMPONENTS

const SummaryCard = ({ label, value, trend, trendType, subtext, icon, color, showArrow }: any) => (
  <Card className="bg-[#161B22] border-none p-6 rounded-3xl group hover:bg-[#1c222b] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={cn(
        "p-3 rounded-2xl text-white",
        color === 'blue' ? 'bg-blue-600' : 
        color === 'red' ? 'bg-rose-600' : 
        color === 'green' ? 'bg-emerald-600' : 'bg-purple-600'
      )}>
        {icon}
      </div>
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />}
    </div>
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    <div className="flex items-center gap-2 mt-3">
      {trend && (
        <span className={cn(
          "text-xs font-bold flex items-center gap-1",
          trendType === 'up' ? 'text-emerald-500' : 'text-rose-500'
        )}>
          {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      )}
      {subtext && <span className="text-xs text-gray-500 font-medium">{subtext}</span>}
      {!subtext && (
        <div className="h-6 w-20 ml-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="v" 
                stroke={trendType === 'up' ? '#10b981' : '#ef4444'} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </Card>
);

const MiniStatCard = ({ label, value, icon, color }: any) => (
  <Card className="bg-[#161B22] border-none p-5 rounded-2xl flex items-center gap-4">
    <div className={cn(
      "p-2.5 rounded-xl",
      color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 
      color === 'red' ? 'bg-rose-500/10 text-rose-500' : 
      color === 'green' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'
    )}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <h4 className="text-lg font-bold text-white">{value}</h4>
    </div>
  </Card>
);

const AlertItem = ({ title, desc, tag, icon, color }: any) => (
  <div className="p-4 bg-[#0B0E14] rounded-2xl border border-white/5 flex items-start gap-4 group cursor-pointer hover:bg-white/5 transition-all">
    <div className={cn(
      "p-2.5 rounded-xl shrink-0",
      color === 'orange' ? 'bg-orange-500/10 text-orange-500' : 'bg-rose-500/10 text-rose-500'
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white truncate">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
      <p className={cn(
        "text-[10px] font-black mt-2 uppercase tracking-widest",
        color === 'orange' ? 'text-blue-500' : 'text-rose-500'
      )}>{tag}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors self-center" />
  </div>
);

const UpcomingItem = ({ day, date, amount, active }: any) => (
  <div className={cn(
    "flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all",
    active ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20" : "bg-[#0B0E14] border-white/5"
  )}>
    <span className={cn("text-[10px] font-bold uppercase", active ? "text-blue-100" : "text-gray-500")}>{day}</span>
    <span className="text-lg font-black text-white my-1">{date}</span>
    <span className={cn("text-[10px] font-bold", active ? "text-white" : "text-gray-400")}>{amount}</span>
  </div>
);

const ActivityItem = ({ title, desc, time, amount, icon, color }: any) => (
  <div className="flex gap-4">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
      color === 'green' ? 'bg-emerald-500/10 text-emerald-500' : 
      color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <p className="text-sm font-bold text-white truncate">{title}</p>
        <span className="text-[10px] font-bold text-gray-600 shrink-0">{time}</span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
      {amount && <p className="text-sm font-black text-white mt-1">{amount}</p>}
    </div>
  </div>
);

export default Index;