"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  ArrowDownCircle, 
  DollarSign,
  Wallet,
  History,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Loader2,
  Trash2,
  Percent,
  RotateCcw,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { TenantCollectionList } from '@/components/financial/TenantCollectionList';
import { SharedBillsTab } from '@/components/financial/SharedBillsTab';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isBillOverdue } from '@/utils/financial';

const Financial = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Tipos que são considerados Receita (Entrada)
  const isIncomeType = (type: string) => {
    const t = type?.toLowerCase() || '';
    return ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet', 'condominio', 'taxa extra', 'luz', 'taxa', 'multa', 'juros', 'multa_juros'].includes(t);
  };

  // Busca de faturas com cache
  const { data: bills = [], isLoading: loadingBills } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*, properties(name), tenants(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Busca de contratos para cálculo de pendências
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts-active-financial'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, properties(condo_fee)')
        .eq('status', 'ativo');
      if (error) throw error;
      return data || [];
    }
  });

  // Cálculos de estatísticas otimizados com useMemo
  const stats = useMemo(() => {
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const currentDay = new Date().getDate();
    
    let inc = 0, exp = 0, pen = 0, atr = 0;
    
    bills.forEach(b => {
      const val = Number(b.total_value || b.calculated_value || 0);
      const isIncome = isIncomeType(b.type);
      
      if (b.status === 'pago') {
        if (isIncome) inc += val;
        else exp += val;
      } else {
        const contract = contracts.find(c => c.tenant_id === b.tenant_id && c.property_id === b.property_id);
        if (isBillOverdue(b, contract?.due_day || 5)) {
          atr += val;
        } else {
          if (isIncome) pen += val;
        }
      }
    });

    // Projeções de Aluguel e Condomínio para o mês atual
    contracts.forEach(c => {
      const dueDay = c.due_day || 5;
      const isOverdue = currentDay > dueDay;

      // Só projeta se já estiver na data de vencimento ou depois
      if (currentDay >= dueDay) {
        // Aluguel
        const rentBills = bills.filter(b => 
          b.tenant_id === c.tenant_id && 
          b.property_id === c.property_id &&
          (b.type === 'aluguel' || b.type === 'receita') && 
          b.month === currentMonth && 
          b.year === currentYear
        );
        const totalRentLaunched = rentBills.reduce((acc, b) => acc + Number(b.total_value || b.calculated_value || 0), 0);
        const remainingRent = Math.max(0, Number(c.rent_value || 0) - totalRentLaunched);

        if (remainingRent > 0) {
          if (isOverdue) atr += remainingRent;
          else pen += remainingRent;
        }

        // Condomínio
        const condoFee = Number(c.properties?.condo_fee || 0);
        const hasCondoBill = bills.some(b => 
          b.tenant_id === c.tenant_id && 
          b.property_id === c.property_id &&
          b.type === 'condominio' && 
          b.month === currentMonth && 
          b.year === currentYear
        );
        if (condoFee > 0 && !hasCondoBill) {
          if (isOverdue) atr += condoFee;
          else pen += condoFee;
        }
      }
    });

    return { income: inc, expense: exp, balance: inc - exp, pending: pen, overdue: atr };
  }, [bills, contracts]);

  const displayItems = useMemo(() => {
    return bills.map(bill => {
      const isCharge = bill.type === 'multa' || bill.type === 'juros' || bill.type === 'multa_juros';
      return {
        ...bill,
        displayType: bill.type === 'multa' ? 'Multa por Atraso' : bill.type === 'juros' ? 'Juros de Mora' : bill.type === 'multa_juros' ? 'Multa e Juros' : bill.type,
        displayValue: Number(bill.total_value || bill.calculated_value || 0),
        isCharge
      };
    }).filter(item => 
      item.displayType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tenants?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bills, searchTerm]);

  const handleMarkAsPaid = async (id: string) => {
    try {
      const { error } = await supabase.from('bills').update({ status: 'pago', payment_date: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      showSuccess('Pagamento confirmado!');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError('Erro ao baixar conta: ' + err.message);
    }
  };

  const handleRevertPayment = async (id: string) => {
    try {
      const { error } = await supabase.from('bills').update({ status: 'pendente', payment_date: null }).eq('id', id);
      if (error) throw error;
      showSuccess('Pagamento revertido.');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError('Erro ao reverter: ' + err.message);
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (!window.confirm('Deseja excluir este registro?')) return;
    try {
      await supabase.from('bills').delete().eq('id', item.id);
      showSuccess('Excluído com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Receitas (Pago)" value={`R$ ${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
        <StatCard label="Despesas (Pago)" value={`R$ ${stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<ArrowDownCircle className="text-rose-500" />} color="rose" />
        <StatCard label="Atrasado" value={`R$ ${stats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Clock className={stats.overdue > 0 ? "text-rose-500" : "text-slate-400"} />} color={stats.overdue > 0 ? "rose" : "slate"} highlight={stats.overdue > 0} />
        <StatCard label="Pendente" value={`R$ ${stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Clock className="text-amber-500" />} color="amber" />
      </div>

      <Tabs defaultValue="collections" className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <TabsList className="bg-white p-1 shadow-sm border-none h-14 rounded-[1.5rem] overflow-x-auto max-w-full">
            <TabsTrigger value="collections" className="gap-2 px-6 md:px-8 rounded-2xl h-12 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold whitespace-nowrap">
              <Users className="w-4 h-4" /> Cobrança por Inquilino
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2 px-6 md:px-8 rounded-2xl h-12 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold whitespace-nowrap">
              <ArrowRightLeft className="w-4 h-4" /> Dividir Contas
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2 px-6 md:px-8 rounded-2xl h-12 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold whitespace-nowrap">
              <History className="w-4 h-4" /> Transações
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={() => setIsBillingModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-8 rounded-2xl font-black gap-2 shadow-lg flex-1 md:flex-none"><MessageSquare className="w-5 h-5" /> Cobrança Geral</Button>
            <Button onClick={() => setIsModalOpen(true)} className="h-14 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 font-black gap-2 shadow-lg flex-1 md:flex-none"><Plus className="w-5 h-5" /> Nova Transação</Button>
          </div>
        </div>

        <TabsContent value="collections"><TenantCollectionList /></TabsContent>
        <TabsContent value="shared"><SharedBillsTab /></TabsContent>
        <TabsContent value="transactions" className="space-y-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar transação..." className="pl-12 h-12 rounded-2xl border-none premium-shadow bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Card className="premium-card border-none rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-0">
              {loadingBills ? (
                <div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><p className="text-gray-400 font-medium">Sincronizando extrato...</p></div>
              ) : displayItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="p-6 w-10"><Checkbox checked={selectedIds.length === displayItems.length && displayItems.length > 0} onCheckedChange={(checked) => setSelectedIds(checked ? displayItems.map(i => i.id) : [])} /></th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo / Origem</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Imóvel / Inquilino</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referência</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="text-right p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayItems.map((item) => {
                        const contract = contracts.find(c => c.tenant_id === item.tenant_id && c.property_id === item.property_id);
                        const isAtrasado = item.status !== 'pago' && isBillOverdue(item, contract?.due_day || 5);

                        return (
                          <tr key={item.id} className={cn(
                            "border-b border-gray-50 hover:bg-gray-50/30 transition-colors", 
                            isAtrasado ? "bg-rose-50/20 hover:bg-rose-50/40" : item.isCharge ? "bg-slate-50/30" : "", 
                            selectedIds.includes(item.id) && "bg-blue-50/30"
                          )}>
                            <td className="p-6"><Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, item.id] : prev.filter(i => i !== item.id))} /></td>
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center", 
                                  isAtrasado ? "bg-rose-50 text-rose-600" : item.isCharge ? "bg-rose-50 text-rose-600" : item.type === 'despesa' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                  {isAtrasado ? <Percent className="w-5 h-5" /> : item.isCharge ? <Percent className="w-5 h-5" /> : item.type === 'despesa' ? <ArrowDownCircle className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                </div>
                                <div>
                                  <span className={cn("font-bold text-gray-900 capitalize block", isAtrasado && "text-rose-700")}>{item.displayType}</span>
                                  {isAtrasado && <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Atrasado</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-6"><div className="space-y-1"><div className="flex items-center gap-1.5 text-xs font-bold text-gray-700"><Building2 className="w-3 h-3 text-blue-500" /> {item.properties?.name || 'N/A'}</div>{item.tenants?.name && <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400"><User className="w-3 h-3" /> {item.tenants.name}</div>}</div></td>
                            <td className="p-6 text-sm text-gray-500 font-medium">{item.month}/{item.year}</td>
                            <td className="p-6"><p className={cn("font-black", isAtrasado ? "text-rose-600" : "text-gray-900")}>R$ {Number(item.displayValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></td>
                            <td className="p-6">
                              <Badge className={cn(
                                "border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase", 
                                item.status === 'pago' ? "bg-emerald-50 text-emerald-700" : 
                                isAtrasado ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                              )}>
                                {item.status === 'pago' ? 'Pago' : isAtrasado ? 'Atrasado' : 'Pendente'}
                              </Badge>
                            </td>
                            <td className="p-6 text-right"><div className="flex items-center justify-end gap-2">{item.status !== 'pago' ? (<Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(item.id)} className="h-9 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-xs">Baixar</Button>) : item.status === 'pago' && (<Button size="sm" variant="ghost" onClick={() => handleRevertPayment(item.id)} className="h-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 font-bold text-xs gap-1.5" title="Reverter"><RotateCcw className="w-3.5 h-3.5" /> Reverter</Button>)}<Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item)} className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (<div className="p-20 text-center flex flex-col items-center"><div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4"><DollarSign className="w-8 h-8" /></div><h3 className="text-lg font-bold text-gray-900">Nenhuma transação</h3><p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">Seu histórico financeiro aparecerá aqui assim que você registrar receitas ou despesas.</p></div>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => queryClient.invalidateQueries({ queryKey: ['bills'] })} />
      <BillingSummaryModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} />
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon, color, highlight }: any) => (
  <Card className={cn(
    "premium-card p-8 rounded-[2rem] bg-white border-none transition-all",
    highlight && "ring-2 ring-rose-100 bg-rose-50/30"
  )}>
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center mb-6", 
      color === 'emerald' ? 'bg-emerald-50' : 
      color === 'rose' ? 'bg-rose-50' : 
      color === 'blue' ? 'bg-blue-50' : 
      color === 'amber' ? 'bg-amber-50' : 'bg-slate-50'
    )}>{icon}</div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h3 className={cn(
      "text-2xl font-black mt-1 tracking-tight",
      color === 'rose' && highlight ? "text-rose-600" : "text-gray-900"
    )}>{value}</h3>
  </Card>
);

export default Financial;