"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExtraValuesList, ExtraValue } from './ExtraValuesList';

interface BillingSummaryFormProps {
  tenants: any[];
  selectedTenantId: string;
  onSelectTenant: (id: string) => void;
  loading: boolean;
  filterType: 'all' | 'overdue' | 'current';
  onFilterTypeChange: (type: 'all' | 'overdue' | 'current') => void;
  rentValue: string;
  onRentValueChange: (val: string) => void;
  fineValue: string;
  onFineValueChange: (val: string) => void;
  interestValue: string;
  onInterestValueChange: (val: string) => void;
  extraValues: ExtraValue[];
  onAddExtra: () => void;
  onRemoveExtra: (index: number) => void;
  onUpdateExtra: (index: number, field: keyof ExtraValue, val: string) => void;
  total: number;
}

export const BillingSummaryForm = ({
  tenants,
  selectedTenantId,
  onSelectTenant,
  loading,
  filterType,
  onFilterTypeChange,
  rentValue,
  onRentValueChange,
  fineValue,
  onFineValueChange,
  interestValue,
  onInterestValueChange,
  extraValues,
  onAddExtra,
  onRemoveExtra,
  onUpdateExtra,
  total
}: BillingSummaryFormProps) => {
  return (
    <div className="p-6 md:p-8 space-y-6 bg-white overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Cobrança Detalhada</h2>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Inquilino</Label>
          <Select onValueChange={onSelectTenant} value={selectedTenantId}>
            <SelectTrigger className="h-12 rounded-xl bg-blue-50/50 border-blue-100 font-bold text-blue-900">
              <div className="flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <SelectValue placeholder="Escolha um inquilino..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {tenants.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTenantId && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">O que cobrar?</Label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => onFilterTypeChange('all')}
                className={cn(
                  "py-2 rounded-lg text-xs font-bold transition-all",
                  filterType === 'all' ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Tudo Pendente
              </button>
              <button
                type="button"
                onClick={() => onFilterTypeChange('overdue')}
                className={cn(
                  "py-2 rounded-lg text-xs font-bold transition-all",
                  filterType === 'overdue' ? "bg-white shadow-sm text-rose-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Apenas Atrasados
              </button>
              <button
                type="button"
                onClick={() => onFilterTypeChange('current')}
                className={cn(
                  "py-2 rounded-lg text-xs font-bold transition-all",
                  filterType === 'current' ? "bg-white shadow-sm text-amber-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Mês Atual
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel (R$)</Label>
            <Input 
              type="number" 
              className="h-11 rounded-xl bg-slate-50 border-none font-bold" 
              value={rentValue} 
              onChange={(e) => onRentValueChange(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Multa/Juros (R$)</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                className="h-11 rounded-xl bg-rose-50/50 border-none font-bold text-rose-700" 
                value={fineValue} 
                onChange={(e) => onFineValueChange(e.target.value)} 
                placeholder="Multa" 
              />
              <Input 
                type="number" 
                className="h-11 rounded-xl bg-rose-50/50 border-none font-bold text-rose-700" 
                value={interestValue} 
                onChange={(e) => onInterestValueChange(e.target.value)} 
                placeholder="Juros" 
              />
            </div>
          </div>
        </div>

        <ExtraValuesList 
          extraValues={extraValues}
          onAddExtra={onAddExtra}
          onRemoveExtra={onRemoveExtra}
          onUpdateExtra={onUpdateExtra}
        />
      </div>

      <div className="pt-4 border-t border-slate-50">
        <div className="flex justify-between items-center p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Geral</span>
          </div>
          <span className="text-xl font-black">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};