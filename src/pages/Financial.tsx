"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  ArrowUpCircle, 
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
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { TenantCollectionList } from '@/components/financial/TenantCollectionList';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const Financial = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0, pending: 0 });

  const fetchBills = async () => {
    try {
      setLoading(true);
      
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      const [billsRes, contractsRes] = await Promise.all([
        supabase
          .from('bills')
          .select('*, properties(name), tenants(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('contracts')
          .select('*')
          .eq('status', 'ativo')
      ]);

      if (billsRes.error) throw billsRes.error;
      
      const list = billsRes.data || [];
      const contracts = contractsRes.data || [];
      setBills(list);
      
      const incomeTypes = ['aluguel', 'receita', 'agua', 'energia', 'iptu', 'extra', 'internet'];
      
      let inc = 0, exp = 0, pen = 0;
      list.forEach(b => {
        const val = Number(b.total_value || b.calculated_value || 0);
        const isIncome = incomeTypes.includes(b.type?.toLowerCase());
        
        if (b.status === 'pago') {
          if (isIncome) inc += val;
          else exp += val;
        } else {
          if (isIncome) pen += val;
        }
      });

      // Adiciona projeção de aluguel para contratos ativos que ainda não geraram fatura este mês
      contracts.forEach(c => {
        const rentVal = Number(c.rent_value) || 0;
        const hasBillThisMonth = list.some(b => 
          b.tenant_id === c.tenant_id && 
          b.type === 'aluguel' && 
          b.month === currentMonth &&
          b.year === currentYear
        );

        if (!hasBillThisMonth) {
          pen += rentVal;
        }
      });
      
      setStats({ income: inc, expense: exp, balance: inc - exp, pending: pen });
    } catch (err: any) {
      showError('Erro ao carregar finanças: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'pago' })
        .eq('id', id);
      
      if (error) throw error;
      showSuccess('Pagamento confirmado!');
      fetchBills();
    } catch (err: any) {
      showError('Erro ao baixar conta: ' + err.message);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showSuccess('Transação excluída com sucesso.');
      fetchBills();
    } catch (err: any) {
      showError('Erro ao excluir: ' + err.message);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Receitas (Pago)" value={`R$ ${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
        <StatCard label="Despesas (Pago)" value={`R$ ${stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<ArrowDownCircle className="text-rose-500" />} color="rose" />
        <StatCard label="Lucro Líquido" value={`R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Wallet className="text-blue-500" />} color="blue" />
        <StatCard label="A Receber Total" value={`R$ ${stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Clock className="text-amber-500" />} color="amber" />
      </div>

      <Tabs defaultValue="transactions" className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <TabsList className="bg-white p-1 shadow-sm border-none h-14 rounded-[1.5rem]">
            <TabsTrigger value="transactions" className="gap-2 px-8 rounded-2xl h-12 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">
              <History className="w-4 h-4" /> Transações
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2 px-8 rounded-2xl h-12 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">
              <Users className="w-4 h-4" /> Cobranças por Inquilino
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              onClick={() => setIsBillingModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-emerald-100 flex-1 md:flex-none"
            >
              <MessageSquare className="w-5 h-5" /> Cobrança Geral
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="h-14 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 font-black gap-2 shadow-lg flex-1 md:flex-none">
              <Plus className="w-5 h-5" /> Nova Transação
            </Button>
          </div>
        </div>

        <TabsContent value="transactions" className="space-y-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar transação..." className="pl-12 h-12 rounded-2xl border-none premium-shadow bg-white" />
          </div>

          <Card className="premium-card border-none rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-gray-400 font-medium">Sincronizando extrato...</p>
                </div>
              ) : bills.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo / Origem</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Imóvel / Inquilino</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referência</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                        <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="text-right p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) => (
                        <tr key={bill.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                bill.type === 'despesa' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                {bill.type === 'despesa' ? <ArrowDownCircle className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                              </div>
                              <span className="font-bold text-gray-900 capitalize">{bill.type}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <Building2 className="w-3 h-3 text-blue-500" /> {bill.properties?.name || 'N/A'}
                              </div>
                              {bill.tenants?.name && (
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                  <User className="w-3 h-3" /> {bill.tenants.name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-6 text-sm text-gray-500 font-medium">
                            {bill.month}/{bill.year}
                          </td>
                          <td className="p-6 font-black text-gray-900">
                            R$ {Number(bill.total_value || bill.calculated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-6">
                            <Badge className={cn(
                              "border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase",
                              bill.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            )}>
                              {bill.status}
                            </Badge>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {bill.status !== 'pago' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleMarkAsPaid(bill.id)}
                                  className="h-9 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-xs"
                                >
                                  Baixar
                                </Button>
                              )}
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleDeleteBill(bill.id)}
                                className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Nenhuma transação</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">Seu histórico financeiro aparecerá aqui assim que você registrar receitas ou despesas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <TenantCollectionList />
        </TabsContent>
      </Tabs>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchBills}
      />

      <BillingSummaryModal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
      />
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <Card className="premium-card border-none p-8 rounded-[2rem] bg-white">
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
      color === 'emerald' ? 'bg-emerald-50' : 
      color === 'rose' ? 'bg-rose-50' : 
      color === 'blue' ? 'bg-blue-50' : 'bg-amber-50'
    )}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1 tracking-tight">{value}</h3>
  </Card>
);

export default Financial;