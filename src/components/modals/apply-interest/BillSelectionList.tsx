"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillSelectionListProps {
  loading: boolean;
  calculatedBills: any[];
  selectedBillIds: string[];
  setSelectedBillIds: React.Dispatch<React.SetStateAction<string[]>>;
  manualAdjustments: Record<string, { fine: string, interest: string }>;
  handleSaveAdjustment: (billId: string, field: 'fine' | 'interest', value: string) => void;
}

export const BillSelectionList = ({
  loading,
  calculatedBills,
  selectedBillIds,
  setSelectedBillIds,
  manualAdjustments,
  handleSaveAdjustment
}: BillSelectionListProps) => {
  if (loading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
      </div>
    );
  }

  if (calculatedBills.length === 0) {
    return (
      <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">Nenhuma fatura pendente elegível encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {calculatedBills.map(bill => {
        const isSelected = selectedBillIds.includes(bill.id);
        const fineVal = manualAdjustments[bill.id]?.fine ?? bill.calculatedFine.toString();
        const interestVal = manualAdjustments[bill.id]?.interest ?? bill.calculatedInterest.toString();

        return (
          <div 
            key={bill.id} 
            className={cn(
              "p-4 rounded-2xl border transition-all flex flex-col gap-3",
              isSelected ? "bg-rose-50/30 border-rose-100" : "bg-slate-50 border-slate-100 opacity-60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    setSelectedBillIds(prev => 
                      checked ? [...prev, bill.id] : prev.filter(id => id !== bill.id)
                    );
                  }}
                />
                <div>
                  <p className="text-sm font-black text-slate-900 capitalize">
                    {bill.type} ({bill.month}/{bill.year})
                    {bill.isProjected && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-2 uppercase">Projetado</span>}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Vencimento: {bill.dueDate.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={cn(
                  "border-none text-[9px] font-black px-2 py-0.5 rounded-md",
                  bill.daysLate > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                )}>
                  {bill.daysLate} dias de atraso
                </Badge>
              </div>
            </div>

            {isSelected && (
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-dashed border-rose-100/50 text-xs items-end">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Valor Base</p>
                  <p className="font-bold text-slate-700 h-10 flex items-center">R$ {bill.baseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[9px] text-rose-500 font-bold uppercase mb-1">Multa (R$)</p>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-400">R$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={fineVal}
                      onChange={e => handleSaveAdjustment(bill.id, 'fine', e.target.value)}
                      className="h-10 pl-7 rounded-xl bg-white border-rose-100 font-bold text-rose-700 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-rose-500 font-bold uppercase mb-1">Juros (R$)</p>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-400">R$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={interestVal}
                      onChange={e => handleSaveAdjustment(bill.id, 'interest', e.target.value)}
                      className="h-10 pl-7 rounded-xl bg-white border-rose-100 font-bold text-rose-700 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};