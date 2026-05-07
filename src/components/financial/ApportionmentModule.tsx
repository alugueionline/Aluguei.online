"use client";

import React, { useState } from 'react';
import { Calculator, Users, Receipt, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const ApportionmentModule = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, type: 'Luz', total: 400, participants: 4, status: 'Pendente', date: '2024-03-15' },
    { id: 2, type: 'Água', total: 180, participants: 3, status: 'Processado', date: '2024-03-10' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rateio de Despesas</h2>
          <p className="text-sm text-gray-500">Divida contas compartilhadas entre múltiplos inquilinos</p>
        </div>
        <Button className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl gap-2 font-bold shadow-md">
          <Plus className="w-4 h-4" />
          Novo Rateio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Receipt className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{expense.type}</h3>
                    <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                  expense.status === 'Processado' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                )}>
                  {expense.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Valor Total</p>
                  <p className="text-lg font-bold text-gray-900">R$ {expense.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Participantes</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700">{expense.participants} casas</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Individual</p>
                  <p className="text-lg font-bold text-blue-600">R$ {(expense.total / expense.participants).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-lg gap-2 font-bold">
                  Ver Detalhes
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-[#F7F9FC] p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Calculadora Rápida</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Valor da Conta</label>
                <Input placeholder="R$ 0,00" className="bg-white border-none h-12 rounded-xl shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nº de Inquilinos</label>
                <Input type="number" placeholder="1" className="bg-white border-none h-12 rounded-xl shadow-sm" />
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-600">Valor por pessoa:</span>
                  <span className="text-xl font-black text-gray-900">R$ 0,00</span>
                </div>
                <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold h-12">
                  Gerar Cobranças
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};