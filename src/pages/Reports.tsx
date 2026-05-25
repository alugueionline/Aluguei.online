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
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Zap,
  Droplets,
  Globe,
  Home,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Percent
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
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { showSuccess, showError } from '@/utils/toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#2563FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

const Reports = () => {
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    receita: 0,
    despesas: 0,
    lucro: 0,
    ocupacao: 0,
    receitaAnual: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('status', 'pago');

      if (error) throw error;

      const { data: properties } = await supabase.from('properties').select('status');

      if (bills) {
        const incomeTypes = ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet', 'condominio', 'multa', 'juros', 'multa_juros'];
        const now = new Date();
        const oneYearAgo = subMonths(now, 12);
        
        let totalRec = 0;
        let totalExp = 0;
        let annualRec = 0;
        const categories: Record<string, { amount: number, count: number, annualAmount: number }> = {};

        bills.forEach(b => {
          const totalVal = Number(b.total_value || b.calculated_value || 0);
          const type = b.type?.toLowerCase() || 'outros';
          const isIncome = incomeTypes.includes(type);
          
          const billDate = b.payment_date ? parseISO(b.payment_date) : new Date(Number(b.year), Number(b.month) - 1, 1);
          const isWithinLastYear = billDate >= oneYearAgo;

          if (isIncome) {
            totalRec += totalVal;
            if (isWithinLastYear) annualRec += totalVal;

            if (!categories[type]) categories[type] = { amount: 0, count: 0, annualAmount: 0 };
            categories[type].amount += totalVal;
            categories[type].count += 1;
            if (isWithinLastYear) categories[type].annualAmount += totalVal;
          } else {
            totalExp += totalVal;
          }
        });

        setStats(prev => ({ 
          ...prev, 
          receita: totalRec, 
          despesas: totalExp, 
          lucro: totalRec - totalExp,
          receitaAnual: annualRec
        }));

        const formattedCategories = Object.entries(categories).map(([name, data]) => ({
          name: name === 'multa_juros' ? 'Multa e Juros' : name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((data.amount / (totalRec || 1)) * 100),
          amount: data.amount,
          annualAmount: data.annualAmount,
          count: data.count
        })).sort((a, b) => b.annualAmount - a.annualAmount);

        setCategoryData(formattedCategories);

        const last6Months = Array.from({ length: 6 }).map((_, i) => {
          const date = subMonths(now, i);
          return {
            monthName: format(date, 'MMM', { locale: ptBR }),
            monthNum: format(date, 'MM'),
            year: format(date, 'yyyy'),
            value: 0
          };
        }).reverse();

        last6Months.forEach(monthData => {
          const monthBills = bills.filter(b => {
            const isIncome = incomeTypes.includes(b.type?.toLowerCase());
            if (b.payment_date) {
              const pDate = parseISO(b.payment_date);
              return isIncome && 
                     format(pDate, 'MM') === monthData.monthNum && 
                     format(pDate, 'yyyy') === monthData.year;
            }
            return isIncome && b.month === monthData.monthNum && b.year === monthData.year;
          });

          monthData.value = monthBills.reduce((acc, curr) => acc + Number(curr.total_value || curr.calculated_value || 0), 0);
        });

        setRevenueHistory(last6Months.map(m => ({ month: m.monthName, value: m.value })));
      }

      if (properties) {
        const occupied = properties.filter(p => p.status === 'alugado').length;
        const rate = properties.length > 0 ? (occupied / properties.length) * 100 : 0;
        setStats(prev => ({ ...prev, ocupacao: rate }));
      }

    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExportPDF = () => {
    if (categoryData.length === 0) {
      showError("Não há dados para exportar.");
      return;
    }

    try {
      const doc = new jsPDF();
      const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm');
      
      const primaryColor = [37, 99, 255]; 
      const secondaryColor = [15, 23, 42]; 
      const lightGray = [248, 250, 252];

      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ALUGUEI.ONLINE', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('RELATÓRIO DE PERFORMANCE FINANCEIRA', 15, 28);
      doc.text(`Gerado em: ${timestamp}`, 150, 20);

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Executivo', 15, 55);

      const drawMetric = (label: string, value: string, x: number, y: number) => {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.roundedRect(x, y, 45, 25, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), x + 5, y + 8);
        doc.setFontSize(11);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(value, x + 5, y + 18);
      };

      drawMetric('Receita Anual', `R$ ${stats.receitaAnual.toLocaleString('pt-BR')}`, 15, 62);
      drawMetric('Despesas Totais', `R$ ${stats.despesas.toLocaleString('pt-BR')}`, 65, 62);
      drawMetric('Lucro Líquido', `R$ ${stats.lucro.toLocaleString('pt-BR')}`, 115, 62);
      drawMetric('Taxa Ocupação', `${stats.ocupacao.toFixed(1)}%`, 165, 62);

      doc.setFontSize(14);
      doc.text('Detalhamento por Categoria (12 meses)', 15, 105);

      autoTable(doc, {
        startY: 112,
        head: [['Categoria', 'Faturas', 'Participação', 'Valor Anual (R$)']],
        body: categoryData.map(cat => [
          cat.name,
          cat.count.toString(),
          `${cat.value}%`,
          `R$ ${cat.annualAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]),
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [252, 253, 255]
        },
        margin: { left: 15, right: 15 }
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Este documento é para fins informativos e de gestão interna.', 15, 285);
        doc.text(`Página ${i} de ${pageCount}`, 180, 285);
      }

      doc.save(`Relatorio-AlugueiOnline-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      showSuccess("Relatório PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      showError("Erro ao gerar PDF.");
    }
  };

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('aluguel')) return <Home className="w-4 h-4" />;
    if (n.includes('energia')) return <Zap className="w-4 h-4" />;
    if (n.includes('agua')) return <Droplets className="w-4 h-4" />;
    if (n.includes('internet')) return <Globe className="w-4 h-4" />;
    if (n.includes('multa') || n.includes('juros')) return <Percent className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  const getCategoryColor = (index: number) => COLORS[index % COLORS.length];

  if (loading) {
    return (
      <DashboardLayout title="Análise de Performance">
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-medium">Gerando inteligência financeira...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Análise de Performance">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inteligência Financeira</h2>
            <p className="text-slate-500 text-sm font-medium">Visão detalhada de ganhos por categoria no último ano.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-semibold text-slate-600 shadow-sm gap-2">
              <Calendar className="w-4 h-4" /> Últimos 12 Meses
            </Button>
            <Button 
              onClick={handleExportPDF}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg gap-2"
            >
              <FileDown className="w-4 h-4" /> Exportar PDF Premium
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Receita Anual (12m)" 
            value={`R$ ${stats.receitaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            trend="Total Acumulado" 
            type="up" 
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <MetricCard 
            label="Média Mensal" 
            value={`R$ ${(stats.receitaAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            trend="Projeção" 
            type="up" 
            icon={<BarChart3 className="w-5 h-5" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <MetricCard 
            label="Despesas (Total)" 
            value={`R$ ${stats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            trend="Saídas" 
            type="down" 
            icon={<ArrowDownRight className="w-5 h-5" />}
            iconBg="bg-rose-50 text-rose-600"
          />
          <MetricCard 
            label="Taxa de Ocupação" 
            value={`${stats.ocupacao.toFixed(1)}%`} 
            trend="Imóveis" 
            type="up" 
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Ganhos por Categoria (Últimos 12 meses)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <Card key={cat.name} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", idx === 0 ? "bg-blue-600" : idx === 1 ? "bg-emerald-500" : idx === 2 ? "bg-amber-500" : "bg-purple-500")}>
                      {getCategoryIcon(cat.name)}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black border-slate-100 text-slate-400">
                      {cat.count} faturas
                    </Badge>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{cat.name}</p>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">
                    R$ {cat.annualAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                  <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", idx === 0 ? "bg-blue-600" : idx === 1 ? "bg-emerald-500" : idx === 2 ? "bg-amber-500" : "bg-purple-500")}
                      style={{ width: `${cat.value}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-2">{cat.value}% da receita total</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <Card className="xl:col-span-8 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Evolução Mensal</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Receita total confirmada nos últimos 6 meses</p>
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
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px' }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2563FF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-4 border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Mix de Receitas</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Distribuição total histórica</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[180px] flex items-center justify-center relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius="70%" outerRadius="90%" paddingAngle={5} dataKey="amount" stroke="none">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">100%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: getCategoryColor(index) }}>
                        {getCategoryIcon(item.name)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{item.count} faturas • {item.value}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">R$ {item.annualAmount.toLocaleString('pt-BR')}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Anual</p>
                    </div>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-slate-400 text-xs font-medium">Nenhum dado disponível.</p>
                  </div>
                )}
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