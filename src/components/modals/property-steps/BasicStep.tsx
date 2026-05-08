"use client";

import React from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const BasicStep = ({ formData, setFormData }: BasicStepProps) => {
  const handleNumberChange = (field: string, value: string) => {
    // Remove leading zeros unless the value is just "0"
    const cleanValue = value.replace(/^0+(?=\d)/, '');
    setFormData({ ...formData, [field]: cleanValue });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome de Exibição</Label>
          <Input 
            placeholder="Ex: Apartamento Luxo - Ed. Horizon" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Imóvel</Label>
          <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="kitnet">Kitnet</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel Base (R$)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
            <Input 
              type="number" 
              placeholder="0,00"
              value={formData.base_rent}
              onFocus={(e) => e.target.value === '0' && handleNumberChange('base_rent', '')}
              onChange={e => handleNumberChange('base_rent', e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-black text-slate-900 text-lg"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Detalhada</Label>
        <Textarea 
          placeholder="Descreva os diferenciais do imóvel..." 
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="rounded-2xl bg-slate-50 border-none font-medium min-h-[120px] p-5 focus-visible:ring-2 focus-visible:ring-blue-500/20"
        />
      </div>
    </div>
  );
};