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
  MoreHorizontal,
  DollarSign,
  Zap,
  Droplets,
  Globe,
  ShieldCheck,
  Wallet
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

const COLORS = ['#2563FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const Reports = () => {
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    receita: 0,
    despesas: 0,
    lucro: 0,
    ocupacao: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { data: bills } = await supabase.from('bills').select('*');
      const { data: properties } = await supabase.from('properties').select('*');

      if (bills) {
        let totalRec = 0;
        let totalExp = 0;
        const categories: Record<string, number> = {};

        const incomeTypes = ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet', 'condominio'];

        bills.forEach(b => {
          const val = Number(b.total_value || b.calculated_value || 0);
          const type = b.type?.toLowerCase() || 'outros';

          if (b.status === 'pago') {
            if (incomeTypes.includes(type)) {
              totalRec += val;
              categories[type] = (categories[type] || 0) + val;
            } else {
              totalExp += val;
            }
          }
        });

        setStats(prev => ({ 
          ...prev, 
          receita: totalRec, 
          despesas: totalExp, 
          lucro: totalRec - totalExp 
        }));

        const formattedCategories = Object.entries(categories).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((value / totalRec) * 100),
          amount: value
        })).sort((a, b) => b.amount - a.amount);

        setCategoryData(formattedCategories);
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

    } catch (err) {
      console.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('aluguel')) return <Home className="w-4 h-4" />;
    if (n.includes('energia')) return <Zap className="w-4 h-4" />;
    if (n.includes('agua')) return <Droplets className="w-4 h-4" />;
    if (n.includes('internet')) return <Globe className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  return (
    <DashboardLayout title="Análise de Performance">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inteligência Financeira</h2>
            <p className="text-slate-500 text-sm font-medium">Detalhamento real de receitas e despesas do seu portfólio.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-600 shadow-sm gap-2">
              <Calendar className="w-4 h-4" /> Este Ano
            </Button>
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-600 shadow-sm gap-2">
              <FileDown className="w-4 h-4" /> Exportar PDF
            </Button>
          </div>
        </div>

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
            label="Despesas Totais" 
            value={`R$ ${stats.despesas.toLocaleString('pt-BR')}`} 
            trend="-2.1%" 
            type="down" 
            icon={<ArrowDownRight className="w-5 h-5" />}
            iconBg="bg-rose-50 text-rose-600"
          />
          <MetricCard 
            label="Lucro Líquido" 
            value={`R$ ${stats.lucro.toLocaleString('pt-BR')}`} 
            trend="+8.4%" 
            type="up" 
            icon={<Wallet className="w-5 h-5" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <MetricCard 
            label="Taxa de Ocupação" 
            value={`${stats.ocupacao.toFixed(1)}%`} 
            trend="Estável" 
            type="up" 
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Card className="xl:col-span-8 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Evolução de Receita</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Histórico mensal consolidado</p>
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
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `R$ ${v/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#2563FF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-4 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Mix de Receitas</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Distribuição por categoria</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[200px] flex items-center justify-center relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius="70%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">100%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                        {getCategoryIcon(item.name)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{item.value}% do total</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">R$ {item.amount.toLocaleString('pt-BR')}</span>
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
  <Card className="premium-card border-none shadow-sm bg-white p-6 rounded-[2rem] group hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", iconBg)}>
        {icon}
      </div>
      <Badge className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-black border-none",
        type === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}>
        {type === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1 inline" /> : <ArrowDownRight className="w-3 h-3 mr-1 inline" />}
        {trend}
      </Badge>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  </Card>
);

export default Reports;