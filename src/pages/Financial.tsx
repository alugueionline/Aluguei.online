"use client";

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterestFineSettings } from '@/components/financial/InterestFineSettings';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

const Financial = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ receita: 0, despesa: 0, saldo: 0 });

  const fetchFinancialData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select(`*, properties(name), tenants(name)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro Supabase:', error);
        if (error.code === '42P01') {
          showError('Tabela de contas não encontrada. Verifique o banco de dados.');
        } else {
          throw error;
        }
      }
      
      setTransactions(data || []);

      let rec = 0, des = 0;
      data?.forEach(t => {
        const val = Number(t.total_value);
        if (t.type === 'receita' || t.type === 'aluguel') rec += val;
        else des += val;
      });
      setStats({ receita: rec, despesa: des, saldo: rec - des });
    } catch (error) {
      showError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Finanças</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Controle de receitas e despesas</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsTransactionModalOpen(true)} className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 px-8 shadow-lg">
              <Plus className="w-5 h-5" /> Nova Transação
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Receita Bruta" value={`R$ ${stats.receita.toLocaleString('pt-BR')}`} trend="+ 0%" type="up" icon={<TrendingUp className="w-6 h-6" />} />
          <StatCard label="Despesas Totais" value={`R$ ${stats.despesa.toLocaleString('pt-BR')}`} trend="- 0%" type="down" icon={<TrendingDown className="w-6 h-6" />} />
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Saldo Líquido</p>
            <h3 className="text-3xl font-black text-white mt-2">R$ {stats.saldo.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="settings">Regras</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="premium-card rounded-[2.5rem] border-none overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="text-lg font-black text-slate-900">Últimas Movimentações</h3>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-10 text-center">Carregando...</div>
                ) : transactions.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Imóvel</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Categoria</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Valor</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-t border-slate-50">
                          <td className="p-6 font-bold text-sm">{t.properties?.name || 'N/A'}</td>
                          <td className="p-6 text-xs uppercase font-bold text-slate-500">{t.type}</td>
                          <td className="p-6 font-black text-sm">R$ {Number(t.total_value).toLocaleString('pt-BR')}</td>
                          <td className="p-6">
                            <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase", t.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                              {t.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 text-center text-gray-400">Nenhuma transação registrada.</div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <InterestFineSettings />
          </TabsContent>
        </Tabs>
      </div>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => { setIsTransactionModalOpen(false); fetchFinancialData(); }} 
        onSave={() => {}} 
      />
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, trend, type, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div className={cn("p-3 rounded-2xl", type === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>{icon}</div>
      <Badge className={cn("border-none font-black text-[10px] uppercase px-3 py-1", type === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>{trend}</Badge>
    </div>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
  </div>
);

export default Financial;