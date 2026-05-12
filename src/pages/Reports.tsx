"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  FileDown,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
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
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#2563FF', '#10B981', '#F59E0B', '#8B5CF6'];

const Reports = () => {
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    receita: 0,
    ocupacao: 0,
    inadimplencia: 0,
    crescimento: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { data: bills } = await supabase.from('bills').select('*');
      const { data: properties } = await supabase.from('properties').select('*');

      if (bills) {
        let totalRec = 0;
        bills.forEach(b => {
          if (b.status === 'pago' && (b.type === 'receita' || b.type === 'aluguel')) {
            totalRec += Number(b.total_value);
          }
        });
        setStats(prev => ({ ...prev, receita: totalRec }));
      }

      if (properties) {
        const occupied = properties.filter(p => p.status === 'alugado').length;
        const rate = properties.length > 0 ? (occupied / properties.length) * 100 : 0;
        setStats(prev => ({ ...prev, ocupacao: rate }));
      }

      // Dados para o gráfico de área (Mockados para visualização premium)
      setRevenueHistory([
        { month: 'Jan', value: 4200 },
        { month: 'Fev', value: 5800 },
        { month: 'Mar', value: 5100 },
        { month: 'Abr', value: 7200 },
        { month: 'Mai', value: 8400 },
        { month: 'Jun', value: 9100 },
      ]);

      // Dados para o gráfico de rosca
      setProfitData([
        { name: 'Aluguel', value: 70 },
        { name: 'Taxas', value: 15 },
        { name: 'Serviços', value: 10 },
        { name: 'Outros', value: 5 },
      ]);

    } catch (err) {
      console.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <DashboardLayout title="Análise de Performance">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios Inteligentes</h2>
            <p className="text-slate-500 text-sm font-medium">Acompanhe o crescimento do seu patrimônio em tempo real.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-600 shadow-sm gap-2">
              <Calendar className="w-4 h-4" /> Últimos 6 meses
            </Button>
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-600 shadow-sm gap-2">
              <FileDown className="w-4 h-4" /> Exportar PDF
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Receita Bruta" 
            value={`R$ ${stats.receita.toLocaleString('pt-BR')}`} 
            trend="+12.5%" 
            type="up" 
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <MetricCard 
            label="Taxa de Ocupação" 
            value={`${stats.ocupacao.toFixed(1)}%`} 
            trend="+2.1%" 
            type="up" 
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <MetricCard 
            label="Inadimplência" 
            value={`R$ ${stats.inadimplencia}`} 
            trend="-0.5%" 
            type="down" 
            icon={<AlertCircle className="w-5 h-5" />}
            iconBg="bg-rose-50 text-rose-600"
          />
          <MetricCard 
            label="Crescimento" 
            value={`R$ ${stats.crescimento}`} 
            trend="+5.4%" 
            type="up" 
            icon={<Activity className="w-5 h-5" />}
            iconBg="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Area Chart */}
          <Card className="xl:col-span-8 border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Evolução Financeira</CardTitle>
                <p className="text-xs text-slate-400 font-medium">Receita mensal consolidada</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-8">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563FF" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} 
                      tickFormatter={(v) => `R$ ${v/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        padding: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563FF" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="xl:col-span-4 border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Performance Mix</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Distribuição de receita por categoria</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="h-[250px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={profitData} 
                      innerRadius="70%" 
                      outerRadius="90%" 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                      {profitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-900">100%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                {profitData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const MetricCard = ({ label, value, trend, type, icon, iconBg }: any) => (
  <Card className="border-slate-100 shadow-sm bg-white p-6 rounded-xl group hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", iconBg)}>
        {icon}
      </div>
      <Badge className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold border-none",
        type === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}>
        {type === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1 inline" /> : <ArrowDownRight className="w-3 h-3 mr-1 inline" />}
        {trend}
      </Badge>
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
    </div>
  </Card>
);

export default Reports;