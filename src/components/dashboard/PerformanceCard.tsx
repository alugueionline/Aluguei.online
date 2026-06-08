"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PerformanceCardProps {
  receitas: number;
  pendente: number;
  atrasado: number;
  collectionRate: number;
}

export const PerformanceCard = ({ receitas, pendente, atrasado, collectionRate }: PerformanceCardProps) => {
  const donutData = [
    { name: 'Recebido', value: receitas, color: '#10B981' },
    { name: 'Pendente', value: pendente, color: '#F59E0B' },
    { name: 'Atrasado', value: atrasado, color: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Performance</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Taxa de adimplência atual</p>
      </div>

      <div className="flex justify-center my-4">
        <div className="w-32 h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius="75%"
                outerRadius="95%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900">{collectionRate}%</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Recebido</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-50 pt-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" /> Recebido
          </div>
          <span className="font-black text-slate-900">R$ {receitas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Pendente
          </div>
          <span className="font-black text-slate-900">R$ {pendente.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Atrasado
          </div>
          <span className="font-black text-slate-900">R$ {atrasado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </Card>
  );
};