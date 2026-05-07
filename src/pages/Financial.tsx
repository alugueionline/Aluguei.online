"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign,
  Calendar as CalendarIcon,
  MoreHorizontal,
  FileText,
  Wallet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BillModal } from '@/components/modals/BillModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Financial = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: false });

      if (error) {
        if (error.code !== '42P01') console.error(error);
        setBills([]);
      } else {
        const list = data || [];
        setBills(list);
        
        // Calcular estatísticas
        const income = list.filter(b => (b.type === 'receita' || b.type === 'aluguel') && b.status === 'pago')
          .reduce((acc, curr) => acc + Number(curr.total_value), 0);
        const expense = list.filter(b => b.type === 'despesa' && b.status === 'pago')
          .reduce((acc, curr) => acc + Number(curr.total_value), 0);
        
        setStats({ income, expense, balance: income - expense });
      }
    } catch (err) {
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <DashboardLayout title="Gestão Financeira">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Receitas (Pago)" value={`R$ ${stats.income.toLocaleString('pt-BR')}`} icon={<ArrowUpCircle className="text-emerald-500" />} />
        <StatCard label="Despesas (Pago)" value={`R$ ${stats.expense.toLocaleString('pt-BR')}`} icon={<ArrowDownCircle className="text-rose-500" />} />
        <StatCard label="Saldo Atual" value={`R$ ${stats.balance.toLocaleString('pt-BR')}`} icon={<Wallet className="text-blue-500" />} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar transação..." className="pl-12 h-12 rounded-2xl border-none premium-shadow bg-white" />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto h-12 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 font-bold gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> Nova Transação
        </Button>
      </div>

      <Card className="premium-card border-none rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center text-gray-400">Carregando finanças...</div>
          ) : bills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                    <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimento</th>
                    <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                    <th className="text-left p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
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
                            {bill.type === 'despesa' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                          </div>
                          <span className="font-bold text-gray-900">{bill.description}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-500 font-medium">
                        {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-6 font-black text-gray-900">
                        R$ {Number(bill.total_value).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-6">
                        <Badge className={cn(
                          "border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase",
                          bill.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {bill.status}
                        </Badge>
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

      <BillModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchBills(); }} />
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <Card className="premium-card border-none p-8 rounded-[2rem]">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
  </Card>
);

export default Financial;