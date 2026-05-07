"use client";

import React, { useState } from 'react';
import { Calculator, Users, Receipt, Plus, Trash2, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApportionmentModal } from '@/components/modals/ApportionmentModal';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

export const ApportionmentModule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: 1, type: 'Luz (Área Comum)', total: 400, participants: 4, status: 'Pendente', date: '2024-03-15', individual: 100 },
    { id: 2, type: 'Água Geral', total: 180, participants: 3, status: 'Processado', date: '2024-03-10', individual: 60 },
  ]);

  const handleSaveApportionment = (data: any) => {
    const newExpense = {
      id: Math.random(),
      type: data.type === 'energia' ? 'Energia (Comum)' : data.type === 'agua' ? 'Água (Geral)' : 'Outros',
      total: data.totalValue,
      participants: data.participantsCount,
      status: 'Pendente',
      date: data.date,
      individual: data.individualValue
    };
    setExpenses([newExpense, ...expenses]);
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
    showSuccess('Rateio removido com sucesso!');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rateio de Despesas</h2>
          <p className="text-sm text-slate-500 font-medium">Distribua custos compartilhados entre suas unidades de forma automática</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-2xl h-12 px-6 gap-2 font-bold shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          Novo Rateio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Histórico Recente</h3>
          </div>
          
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Receipt className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{expense.type}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none",
                  expense.status === 'Processado' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                )}>
                  {expense.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-6 py-6 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Valor Total</p>
                  <p className="text-xl font-black text-slate-900">R$ {expense.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Participantes</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-bold text-slate-700">{expense.participants} Unidades</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Cota Individual</p>
                  <p className="text-xl font-black text-[#2563FF]">R$ {expense.individual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
                <Button variant="ghost" size="sm" className="text-[#2563FF] hover:bg-blue-50 rounded-xl h-10 px-6 font-bold gap-2">
                  Ver Detalhes
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-[#2563FF]" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-blue-900">Status de Cobrança</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600/70">Rateios este mês</span>
                <span className="font-black text-xl text-blue-900">{expenses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600/70">Total rateado</span>
                <span className="font-black text-xl text-[#2563FF]">
                  R$ {expenses.reduce((acc, curr) => acc + curr.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-6 border-t border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Ações Rápidas</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-blue-200 bg-white hover:bg-blue-100 rounded-xl h-12 text-xs font-bold text-blue-600">Relatório PDF</Button>
                  <Button variant="outline" className="border-blue-200 bg-white hover:bg-blue-100 rounded-xl h-12 text-xs font-bold text-blue-600">Enviar Alertas</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApportionmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveApportionment}
      />
    </div>
  );
};