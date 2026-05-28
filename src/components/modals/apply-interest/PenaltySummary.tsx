"use client";

import React from 'react';
import { Calculator } from 'lucide-react';

interface PenaltySummaryProps {
  totalOriginal: number;
  totalFines: number;
  totalInterest: number;
  totalPenalties: number;
  totalNew: number;
}

export const PenaltySummary = ({
  totalOriginal,
  totalFines,
  totalInterest,
  totalPenalties,
  totalNew
}: PenaltySummaryProps) => {
  return (
    <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-3 shadow-xl">
      <div className="flex justify-between text-xs font-bold text-slate-400">
        <span>VALOR ORIGINAL ACUMULADO</span>
        <span>R$ {totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-xs font-bold text-rose-400">
        <span>NOVAS MULTAS A GERAR</span>
        <span>+ R$ {totalFines.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-xs font-bold text-rose-400">
        <span>NOVOS JUROS A GERAR</span>
        <span>+ R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      
      <div className="pt-2 border-t border-dashed border-white/10 flex justify-between text-xs font-black text-amber-400">
        <span>TOTAL DE PENALIDADES (MULTA + JUROS)</span>
        <span>+ R$ {totalPenalties.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-sm font-black uppercase tracking-wider">VALOR TOTAL ATUALIZADO</span>
        <span className="text-2xl font-black text-blue-400">R$ {totalNew.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};