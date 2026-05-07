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
  Send,
  Building2,
  User,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InterestFineSettings } from '@/components/financial/InterestFineSettings';
import { ApportionmentModule } from '@/components/financial/ApportionmentModule';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const mockTransactions = [
  { id: '1', type: 'receita', category: 'Aluguel', property: 'Apto 101', tenant: 'João Silva', value: 1200, date: '2024-06-10', status: 'pago' },
  { id: '2', type: 'despesa', category: 'Manutenção', property: 'Casa 02', tenant: 'Maria Oliveira', value: 350, date: '2024-06-12', status: 'pago' },
  { id: '3', type: 'receita', category: 'Aluguel', property: 'Kitnet A', tenant: 'Pedro Santos', value: 850, date: '2024-06-15', status: 'pendente' },
  { id: '4', type: 'despesa', category: 'IPTU', property: 'Apto 101', tenant: 'João Silva', value: 120, date: '2024-06-05', status: 'pago' },
  { id: '5', type: 'receita', category: 'Taxa Extra', property: 'Apto 202', tenant: 'Ana Costa', value: 150, date: '2024-06-18', status: 'pendente' },
];

const Financial = () => {
  const [transactions] = useState(mockTransactions);
  const [chargeData, setChargeData] = useState({ property: '', value: '' });

  const handleExport = () => showSuccess('Relatório financeiro exportado com sucesso!');
  const handleSendCharge = (tenant: string, value: string) => {
    showSuccess(`Cobrança de R$ ${value} enviada para ${tenant} via WhatsApp!`);
  };

  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finanças</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Controle de receitas, despesas e cobranças</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport} className="rounded-2xl border-slate-200 font-bold gap-2 h-12 px-6 bg-white hover:bg-slate-50 text-slate-600 transition-all">
              <Download className="w-4 h-4" /> Exportar
            </Button>
            <Button className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 px-8 shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> Nova Transação
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Receita Bruta" value="R$ 15.420,00" trend="+ 12.5%" type="up" icon={<TrendingUp className="w-6 h-6" />} />
          <StatCard label="Despesas Totais" value="R$ 3.150,00" trend="- 2.4%" type="down" icon={<TrendingDown className="w-6 h-6" />} />
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl group transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-blue-600 rounded-2xl text-white"><DollarSign className="w-6 h-6" /></div>
              <Badge className="bg-blue-600/20 text-blue-400 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Saldo Líquido</Badge>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Resultado do Mês</p>
            <h3 className="text-3xl font-black text-white mt-2">R$ 12.270,00</h3>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm max-w-fit">
            <TabsList className="bg-transparent border-none gap-2">
              <TabsTrigger value="overview" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-[#2563FF] text-slate-500 transition-all">Visão Geral</TabsTrigger>
              <TabsTrigger value="apportionment" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-[#2563FF] text-slate-500 transition-all gap-2"><Calculator className="w-4 h-4" />Rateio</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-[#2563FF] text-slate-500 transition-all gap-2"><Settings2 className="w-4 h-4" />Regras</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cobrança Rápida */}
              <Card className="lg:col-span-1 premium-card rounded-[2.5rem] border-none p-8 h-fit">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Cobrança Rápida
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Imóvel</label>
                    <Select onValueChange={(v) => setChargeData({...chargeData, property: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                        <SelectValue placeholder="Escolha o imóvel..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apto 101">Apto 101 (João Silva)</SelectItem>
                        <SelectItem value="Casa 02">Casa 02 (Maria Oliveira)</SelectItem>
                        <SelectItem value="Kitnet A">Kitnet A (Pedro Santos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor da Cobrança (R$)</label>
                    <Input 
                      type="number" 
                      placeholder="0,00" 
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                      value={chargeData.value}
                      onChange={(e) => setChargeData({...chargeData, value: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={() => handleSendCharge(chargeData.property, chargeData.value)}
                    disabled={!chargeData.property || !chargeData.value}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl gap-2 mt-2"
                  >
                    <Send className="w-4 h-4" /> Enviar via WhatsApp
                  </Button>
                </div>
              </Card>

              {/* Tabela de Transações */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Últimas Movimentações</h3>
                  <div className="relative w-64 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563FF] transition-colors" />
                    <Input placeholder="Buscar..." className="pl-11 bg-white border-slate-100 rounded-xl h-10 text-xs font-medium" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel / Inquilino</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{t.property}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.tenant}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <Badge variant="outline" className="rounded-lg border-slate-100 text-slate-500 font-bold text-[10px] uppercase">
                              {t.category}
                            </Badge>
                          </td>
                          <td className="p-6 font-black text-slate-900 text-sm">
                            R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-6">
                            <Badge className={cn(
                              "rounded-full px-3 py-1 text-[10px] font-black uppercase border-none",
                              t.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            )}>
                              {t.status}
                            </Badge>
                          </td>
                          <td className="p-6 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleSendCharge(t.tenant, t.value.toString())}
                              className="h-10 w-10 rounded-xl text-blue-600 hover:bg-blue-50"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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