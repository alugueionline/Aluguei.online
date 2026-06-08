"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardsProps {
  receitas: number;
  pendente: number;
  atrasado: number;
  collectionRate: number;
}

export const KpiCards = ({ receitas, pendente, atrasado, collectionRate }: KpiCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Recebido */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recebido</span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +12%
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium mt-1">vs. mês anterior</p>
      </Card>

      {/* Pendente */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendente</span>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          R$ {pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium mt-1">A vencer no período</p>
      </Card>

      {/* Atrasado */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atrasado</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-rose-600 tracking-tight">
          R$ {atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium mt-1">Faturas vencidas</p>
      </Card>

      {/* Taxa de Recebimento */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de Recebimento</span>
          <span className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
        <h3 className="text-xl font-black text-blue-600 tracking-tight">
          {collectionRate}%
        </h3>
        <p className="text-[10px] text-slate-400 font-medium mt-1">Eficiência de cobrança</p>
      </Card>
    </div>
  );
};