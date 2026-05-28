"use client";

import React from 'react';
import { Info, AlertCircle, Calendar } from 'lucide-react';

interface CalculationDetailProps {
  originalValue: number;
  daysLate: number;
  finePercent: number;
  interestRate: number;
  interestType: 'daily' | 'weekly' | 'monthly';
}

export const InterestCalculationDetail = ({ 
  originalValue, 
  daysLate, 
  finePercent, 
  interestRate,
  interestType
}: CalculationDetailProps) => {
  const fineValue = originalValue * (finePercent / 100);
  
  let totalInterest = 0;
  let periodLabel = '';

  if (interestType === 'daily') {
    totalInterest = originalValue * (interestRate / 100) * daysLate;
    periodLabel = `${interestRate}% ao dia`;
  } else if (interestType === 'weekly') {
    const weeksLate = Math.floor(daysLate / 7);
    totalInterest = originalValue * (interestRate / 100) * weeksLate;
    periodLabel = `${interestRate}% por semana (${weeksLate} sem. completas)`;
  } else {
    const monthsLate = Math.floor(daysLate / 30);
    totalInterest = originalValue * (interestRate / 100) * monthsLate;
    periodLabel = `${interestRate}% ao mês (${monthsLate} meses completos)`;
  }

  const totalUpdated = originalValue + fineValue + totalInterest;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-rose-50 px-6 py-4 flex items-center justify-between border-b border-rose-100">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-bold">Detalhamento de Atraso</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-rose-600 text-xs font-bold shadow-sm">
          <Calendar className="w-3.5 h-3.5" />
          {daysLate} dias de atraso
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Valor Original</span>
          <span className="text-gray-900 font-bold">R$ {originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-50">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Multa Fixa ({finePercent}%)</span>
              <Info className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <span className="text-rose-600 font-bold">+ R$ {fineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Juros ({periodLabel})</span>
            </div>
            <span className="text-rose-600 font-bold">+ R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="pt-6 mt-2 border-t-2 border-dashed border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-base font-black text-gray-900 uppercase tracking-tight">Valor Atualizado</span>
            <div className="text-right">
              <p className="text-2xl font-black text-[#2563FF] leading-none">
                R$ {totalUpdated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Total a Pagar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};