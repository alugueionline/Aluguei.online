"use client";

import React, { useState } from 'react';
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
  ArrowUpRight,
  ArrowDownRight,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterestFineSettings } from '@/components/financial/InterestFineSettings';
import { ApportionmentModule } from '@/components/financial/ApportionmentModule';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const mockTransactions = [
  { id: '1', type: 'receita', category: 'Aluguel', property: 'Apto 101', value: 1200, date: '2024-06-10', status: 'pago' },
  { id: '2', type: 'despesa', category: 'Manutenção', property: 'Casa 02', value: 350, date: '2024-06-12', status: 'pago' },
  { id: '3', type: 'receita', category: 'Aluguel', property: 'Kitnet A', value: 850, date: '2024-06-15', status: 'pendente' },
  { id: '4', type: 'despesa', category: 'IPTU', property: 'Apto 101', value: 120, date: '2024-06-05', status: 'pago' },
];

const Financial = () => {
  const [transactions, setTransactions] = useState(mockTransactions);

  const handleExport = () => showSuccess('Relatório financeiro exportado com sucesso!');
  const handleSendCharge = (property: string) => showSuccess(`Cobrança enviada para o inquilino do ${property}!`);

  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finanças Avançadas</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Controle de receitas, penalidades por atraso e rateio de despesas</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport} className="rounded-2xl border-slate-200 font-bold gap-2 h-12 px-6 bg-white hover:bg-slate-50 text-slate-600 transition-all"><Download className="w-4 h-4" />Exportar Dados</Button>
            <Button className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 px-8 shadow-lg shadow-blue-100 transition-all active:scale-95"><Plus className="w-5 h-5" />Nova Transação</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Receita Bruta" value="R$ 15.420,00" trend="+ 12.5%" type="up" icon={<TrendingUp className="w-6 h-6" />} />
          <StatCard label="Despesas Totais" value="R$ 3.150,00" trend="- 2.4%" type="down" icon={<TrendingDown className="w-6 h-6" />} />
          <div className="bg-[#2563FF] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 group transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/20 rounded-2xl text-white"><DollarSign className="w-6 h-6" /></div>
              <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Saldo Líquido</Badge>
            </div>
            <p className="text-sm font-bold text-blue-100 uppercase tracking-[0.2em]">Resultado do Mês</p>
            <h3 className="text-3xl font-black text-white mt-2">R$ 12.270,00</h3>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm max-w-fit">
            <TabsList className="bg-transparent border-none gap-2">
              <TabsTrigger value="overview" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-[#2563FF] text-slate-500 transition-all">Visão Geral</TabsTrigger>
              <TabsTrigger value="apportionment" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-[#2563FF] text-slate-500 transition-all gap-2"><Calculator className="w-4 h-4" />Rateio de Contas</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-[#2563FF] text-slate-500 transition-all gap-2"><Settings2 className="w-4 h-4" />Configurações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                <div className="relative flex-1 max-w-lg group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563FF] transition-colors" />
                  <Input placeholder="Buscar transações..." className="pl-12 bg-white border-slate-100 rounded-2xl h-14 font-medium shadow-sm focus:ring-[#2563FF]/10 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transação</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", t.type === 'receita' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                              {t.type === 'receita' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <span className="font-bold text-slate-900">{t.category}</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm font-medium text-slate-600">{t.property}</td>
                        <td className="p-6 text-sm text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                        <td className="p-6 font-black text-slate-900">R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-6">
                          <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase border-none", t.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="p-6 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleSendCharge(t.property)} className="text-blue-600 hover:bg-blue-50 rounded-xl gap-2 font-bold">
                            <Send className="w-4 h-4" /> Cobrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      <div className={cn("p-3 rounded-2xl transition-colors", type === 'up' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" : "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white")}>
        {icon}
      </div>
      <Badge className={cn("border-none font-black text-[10px] uppercase tracking-widest px-3 py-1", type === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
        {trend}
      </Badge>
    </div>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
  </div>
);

export default Financial;