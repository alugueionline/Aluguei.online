"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2 } from 'lucide-react';

interface InterestSettingsFormProps {
  config: {
    finePercent: number;
    interestRate: number;
    interestType: 'daily' | 'weekly' | 'monthly';
    gracePeriod: number;
  };
  setConfig: React.Dispatch<React.SetStateAction<{
    finePercent: number;
    interestRate: number;
    interestType: 'daily' | 'weekly' | 'monthly';
    gracePeriod: number;
  }>>;
}

export const InterestSettingsForm = ({ config, setConfig }: InterestSettingsFormProps) => {
  return (
    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
      <div className="flex items-center gap-2 text-slate-900 mb-1">
        <Settings2 className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-black uppercase tracking-widest">Ajustar Taxas para esta Cobrança</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">Multa Fixa (%)</Label>
          <Input 
            type="number" 
            value={config.finePercent} 
            onChange={e => setConfig(prev => ({ ...prev, finePercent: parseFloat(e.target.value) || 0 }))}
            className="h-10 rounded-xl bg-white border-slate-200 font-bold text-center text-xs" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">Juros (%)</Label>
          <Input 
            type="number" 
            value={config.interestRate} 
            onChange={e => setConfig(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
            className="h-10 rounded-xl bg-white border-slate-200 font-bold text-center text-xs" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">Frequência</Label>
          <Select 
            value={config.interestType} 
            onValueChange={(v: any) => setConfig(prev => ({ ...prev, interestType: v }))}
          >
            <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 font-bold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};