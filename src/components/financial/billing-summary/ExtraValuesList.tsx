"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export interface ExtraValue {
  label: string;
  value: string;
  quantity?: string;
  unitPrice?: string;
}

interface ExtraValuesListProps {
  extraValues: ExtraValue[];
  onAddExtra: () => void;
  onRemoveExtra: (index: number) => void;
  onUpdateExtra: (index: number, field: keyof ExtraValue, val: string) => void;
}

export const ExtraValuesList = ({
  extraValues,
  onAddExtra,
  onRemoveExtra,
  onUpdateExtra
}: ExtraValuesListProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outros Débitos / Energia</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAddExtra} 
          className="h-6 px-2 text-blue-600 font-bold text-[10px]"
        >
          <Plus className="w-3 h-3 mr-1" /> ADICIONAR
        </Button>
      </div>
      
      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
        {extraValues.map((extra, index) => (
          <div key={index} className="p-3 rounded-2xl bg-slate-50 space-y-3 border border-slate-100">
            <div className="flex gap-2">
              <Input 
                placeholder="Ex: Energia" 
                className="h-9 rounded-lg bg-white border-slate-200 text-xs font-bold flex-1" 
                value={extra.label} 
                onChange={(e) => onUpdateExtra(index, 'label', e.target.value)} 
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemoveExtra(index)} 
                className="h-9 w-9 text-slate-300 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase">kWh</Label>
                <Input 
                  type="number" 
                  placeholder="Qtd" 
                  className="h-8 rounded-lg bg-white border-slate-200 text-xs" 
                  value={extra.quantity || ''} 
                  onChange={(e) => onUpdateExtra(index, 'quantity', e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase">Preço Unit.</Label>
                <Input 
                  type="number" 
                  placeholder="R$" 
                  className="h-8 rounded-lg bg-white border-slate-200 text-xs" 
                  value={extra.unitPrice || ''} 
                  onChange={(e) => onUpdateExtra(index, 'unitPrice', e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-blue-600 uppercase">Total Item</Label>
                <Input 
                  type="number" 
                  className="h-8 rounded-lg bg-blue-50 border-none text-xs font-black text-blue-700" 
                  value={extra.value} 
                  onChange={(e) => onUpdateExtra(index, 'value', e.target.value)} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};