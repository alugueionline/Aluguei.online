"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  FileDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const profitData = [
  { name: 'Apto 101', receita: 1200, custos: 150 },
  { name: 'Casa 02', receita: 2500, custos: 400 },
  { name: 'Kitnet A', receita: 850, custos: 100 },
  { name: 'Apto 202', receita: 1300, custos: 180 },
];

const revenueHistory = [
  { month: 'Jan', value: 12000 },
  { month: 'Fev', value: 13500 },
  { month: 'Mar', value: 12800 },
  { month: 'Abr', value: 15400 },
  { month: 'Mai', value: 14800 },
  { month: 'Jun', value: 16200 },
];

const COLORS = ['#2563FF', '#10b981', '#f59e0b', '#8b5cf6'];

const Reports = () => {
  return (
    <DashboardLayout title="Relatórios e Inteligência">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Análise de Performance</h2>
            <p className="text-slate-500 font-medium">Sua saúde financeira em tempo real</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm gap-2 flex-1 lg:flex-none">
              <Calendar className="w-4 h-4" /> Últimos 6 meses
            </Button>
            <Button variant="outline" className="h-12 px-4 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm flex-1 lg:flex-none">
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg shadow-slate-200">
              <FileDown className="w-4 h-4" /> Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Receita Bruta" value="R$ 15.420" trend="+12.5%" type="up" icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} />
          <MetricCard label="Taxa Ocupação" value="94.2%" trend="+2.1%" type="up" icon={<CheckCircle2 className="w-5 h-5 text-blue-500" />} />
          <MetricCard label="Inadimplência" value="R$ 1.850" trend="-4.3%" type="down" icon={<AlertCircle className="w-5 h-5 text-rose-500" />} />
          <MetricCard label="Crescimento" value="R$ 2.400" trend="+8.4%" type="up" icon={<Activity className="w-5 h-5 text-amber-500" />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <Card className="xl:col-span-8 premium-card border-none rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Evolução Financeira</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2563FF]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receitas</span>
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
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
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563FF" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="xl:col-span-4 premium-card border-none rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Performance Mix</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profitData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="receita"
                  >
                    {profitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {profitData.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">R$ {item.receita}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InsightCard 
            title="Lucratividade em alta" 
            desc="Seu lucro líquido aumentou 12% em comparação ao mês anterior." 
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            color="emerald"
          />
          <InsightCard 
            title="Alerta de Inadimplência" 
            desc="2 imóveis estão com pagamentos pendentes há mais de 5 dias." 
            icon={<AlertCircle className="w-6 h-6 text-rose-600" />}
            color="rose"
          />
          <InsightCard 
            title="Oportunidade de Taxa" 
            desc="Sua taxa de ocupação atingiu 94%, considere reajustes em novas vagas." 
            icon={<Zap className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

const MetricCard = ({ label, value, trend, type, icon }: any) => (
  <Card className="premium-card border-none bg-white p-7 rounded-[2rem] group hover:shadow-xl transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <Badge className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-black tracking-tight",
        type === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}>
        {trend}
      </Badge>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
  </Card>
);

const InsightCard = ({ title, desc, icon, color }: any) => (
  <div className={cn(
    "p-8 rounded-[2.5rem] border-none shadow-sm flex flex-col gap-6 group cursor-default transition-all",
    color === 'emerald' ? "bg-emerald-50/50" : color === 'rose' ? "bg-rose-50/50" : "bg-blue-50/50"
  )}>
    <div className={cn(
      "w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
      color === 'emerald' ? "text-emerald-600" : color === 'rose' ? "text-rose-600" : "text-blue-600"
    )}>
      {icon}
    </div>
    <div>
      <h5 className="text-lg font-black text-slate-900 tracking-tight mb-2">{title}</h5>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Reports;