"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ArrowRightLeft,
  Calendar,
  TrendingUp
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
  
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho (Mês 06)' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const years = [
    { value: 'all', label: 'Todos os anos' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  const isIncomeType = (type: string) => {
    const t = type?.toLowerCase() || '';
    return ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet', 'condominio', 'taxa extra', 'luz', 'taxa', 'multa', 'juros', 'multa_juros'].includes(t);
  };

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

    contracts.forEach(c => {
      const dueDay = c.due_day || 5;
      const isOverdue = currentDay > dueDay;

      if (currentDay >= dueDay) {
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
    }).filter(item => {
      const matchesSearch = item.displayType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tenants?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMonth = filterMonth === 'all' || item.month === filterMonth;
      const matchesYear = filterYear === 'all' || item.year?.toString() === filterYear;

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [bills, searchTerm, filterMonth, filterYear]);

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
      showSuccess('Pagamento reverted.');
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
      {/* Redesenhando os cartões de KPI para ficarem extremamente premium e claros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Cartão Herói: Saldo Líquido (Lucro Real) */}
        <Card className="relative overflow-hidden rounded-[2rem] border-none bg-slate-900 text-white p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                Resultado Real
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Líquido</p>
              <h3 className={cn(
                "text-2xl font-black mt-1 tracking-tight",
                stats.balance >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
                [ Receitas - Despesas ]
              </p>
            </div>
          </div>
        </Card>

        {/* Cartão Receitas */}
        <Card className="premium-card p-6 rounded-[2rem] border-none bg-white transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-black px-2.5 py-1 rounded-lg">
              Entradas
            </Badge>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receitas (Pago)</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-slate-900">
              R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
              Total de entradas confirmadas
            </p>
          </div>
        </Card>

        {/* Cartão Despesas */}
        <Card className="premium-card p-6 rounded-[2rem] border-none bg-white transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <Badge className="bg-rose-50 text-rose-700 border-none text-[10px] font-black px-2.5 py-1 rounded-lg">
              Saídas
            </Badge>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Despesas (Pago)</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-slate-900">
              R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
              Total de saídas e manutenções pagas
            </p>
          </div>
        </Card>

        {/* Cartão Atrasado */}
        <Card className={cn(
          "premium-card p-6 rounded-[2rem] border-none transition-all duration-300 hover:scale-[1.02]",
          stats.overdue > 0 ? "bg-rose-50/30 ring-2 ring-rose-100 shadow-lg shadow-rose-50" : "bg-white"
        )}>
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
              stats.overdue > 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-400"
            )}>
              <Clock className="w-5 h-5" />
            </div>
            <Badge className={cn(
              "border-none text-[10px] font-black px-2.5 py-1 rounded-lg",
              stats.overdue > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
            )}>
              {stats.overdue > 0 ? "Atrasado" : "Em dia"}
            </Badge>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atrasado</p>
            <h3 className={cn(
              "text-2xl font-black mt-1 tracking-tight",
              stats.overdue > 0 ? "text-rose-600" : "text-slate-900"
            )}>
              R$ {stats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
              Faturas vencidas não pagas
            </p>
          </div>
        </Card>
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
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar transação..." className="pl-12 h-12 rounded-2xl border-none premium-shadow bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="w-full md:w-48">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="h-12 rounded-2xl border-none premium-shadow bg-white font-bold">
                  <SelectValue placeholder="Filtrar por Mês" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-40">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="h-12 rounded-2xl border-none premium-shadow bg-white font-bold">
                  <SelectValue placeholder="Filtrar por Ano" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {years.map(y => (
                    <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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