"use client";

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  Plus,
  Search,
  Calculator,
  Settings2,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterestFineSettings } from '@/components/financial/InterestFineSettings';
import { ApportionmentModule } from '@/components/financial/ApportionmentModule';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

const Financial = () => {
  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finanças Avançadas</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Controle de receitas, penalidades por atraso e rateio de despesas</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-slate-200 font-bold gap-2 h-12 px-6 bg-white hover:bg-slate-50 text-slate-600 transition-all">
              <Download className="w-4 h-4" />
              Exportar Dados
            </Button>
            <Button className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 px-8 shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Plus className="w-5 h-5" />
              Nova Transação
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            label="Receita Bruta" 
            value="R$ 45.280,00" 
            trend="+ 12.5%" 
            type="up" 
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard 
            label="Despesas Totais" 
            value="R$ 12.450,00" 
            trend="- 2.4%" 
            type="down" 
            icon={<TrendingDown className="w-6 h-6" />}
          />
          <div className="bg-[#2563FF] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 group transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/20 rounded-2xl text-white">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Saldo Líquido</Badge>
            </div>
            <p className="text-sm font-bold text-blue-100 uppercase tracking-[0.2em]">Resultado do Mês</p>
            <h3 className="text-3xl font-black text-white mt-2">R$ 32.830,00</h3>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm max-w-fit">
            <TabsList className="bg-transparent border-none gap-2">
              <TabsTrigger value="overview" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:shadow-none data-[state=active]:text-[#2563FF] text-slate-500 transition-all">Visão Geral</TabsTrigger>
              <TabsTrigger value="apportionment" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:shadow-none data-[state=active]:text-[#2563FF] text-slate-500 transition-all gap-2">
                <Calculator className="w-4 h-4" />
                Rateio de Contas
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:shadow-none data-[state=active]:text-[#2563FF] text-slate-500 transition-all gap-2">
                <Settings2 className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                <div className="relative flex-1 max-w-lg group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563FF] transition-colors" />
                  <Input 
                    placeholder="Buscar transações, recibos ou inquilinos..." 
                    className="pl-12 bg-white border-slate-100 rounded-2xl h-14 font-medium shadow-sm focus:ring-[#2563FF]/10 transition-all" 
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="rounded-xl gap-2 font-bold text-slate-500 h-14 px-6 hover:bg-slate-100">
                    <Filter className="w-4 h-4" />
                    Filtrar Por
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-4">
                <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                  <PieChart className="w-16 h-16" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Nenhuma transação selecionada</h4>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">Use a barra de busca acima ou os filtros para visualizar seu histórico financeiro detalhado.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apportionment" className="animate-in slide-in-from-bottom-4 duration-500">
            <ApportionmentModule />
          </TabsContent>

          <TabsContent value="settings" className="animate-in slide-in-from-bottom-4 duration-500">
            <InterestFineSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, trend, type, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
    <div className="flex items-center justify-between mb-6">
      <div className={cn(
        "p-3 rounded-2xl transition-colors",
        type === 'up' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" : "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
      )}>
        {icon}
      </div>
      <Badge className={cn(
        "border-none font-black text-[10px] uppercase tracking-widest px-3 py-1",
        type === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}>
        {trend}
      </Badge>
    </div>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
  </div>
);

export default Financial;