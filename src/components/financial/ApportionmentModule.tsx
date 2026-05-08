"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, Users, Receipt, Plus, Trash2, ArrowRight, CheckCircle2, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApportionmentModal } from '@/components/modals/ApportionmentModal';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

export const ApportionmentModule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApportionments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*, properties(name)')
        .not('property_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Agrupar por data de criação aproximada ou tipo/valor para mostrar como um "lote" de rateio
      // Para simplificar a visualização, mostraremos os lançamentos individuais que vieram de rateio
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar rateios:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApportionments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este lançamento de rateio?')) return;
    
    try {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (error) throw error;
      showSuccess('Lançamento removido!');
      fetchApportionments();
    } catch (err: any) {
      showError('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rateio de Despesas</h2>
          <p className="text-sm text-slate-500 font-medium">Distribua custos compartilhados (Água, Luz Comum) entre as unidades.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-2xl h-12 px-6 gap-2 font-bold shadow-lg shadow-blue-100 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Novo Rateio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Lançamentos Recentes</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Receipt className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight capitalize">{expense.type}</h3>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{expense.properties?.name} • {expense.month}/{expense.year}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none",
                    expense.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {expense.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Valor da Cota</p>
                    <p className="text-xl font-black text-[#2563FF]">R$ {Number(expense.calculated_value || expense.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Data Lançamento</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(expense.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-50/50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(expense.id)}
                    className="text-slate-400 hover:text-rose-600 rounded-xl h-10 px-4 font-bold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <Calculator className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">Nenhum rateio realizado ainda.</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-[#2563FF]" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-blue-900">Resumo do Mês</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600/70">Lançamentos</span>
                <span className="font-black text-xl text-blue-900">{expenses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600/70">Total Rateado</span>
                <span className="font-black text-xl text-[#2563FF]">
                  R$ {expenses.reduce((acc, curr) => acc + Number(curr.calculated_value || curr.total_value), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApportionmentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchApportionments(); }} 
        onSave={fetchApportionments}
      />
    </div>
  );
};