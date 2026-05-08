"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const BasicStep = ({ formData, setFormData }: BasicStepProps) => {
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = parseFloat(rawValue) / 100;
    setFormData({ ...formData, base_rent: numericValue.toString() });
  };

  const displayValue = formData.base_rent 
    ? parseFloat(formData.base_rent).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) 
    : "0,00";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome de Exibição</Label>
          <Input 
            placeholder="Ex: Terreno Lote 05 - Setor Sul" 
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
              <SelectItem value="terreno">Terreno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Status Atual</Label>
          <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
            <SelectTrigger className="h-14 rounded-2xl bg-blue-50/50 border-none font-bold text-blue-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="alugado">Alugado</SelectItem>
              <SelectItem value="manutencao">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel Base (R$)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
            <Input 
              type="text" 
              placeholder="0,00"
              value={displayValue}
              onChange={handleCurrencyChange}
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-black text-slate-900 text-lg"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Detalhada</Label>
        <Textarea 
          placeholder="Descreva os diferenciais do imóvel ou terreno..." 
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="rounded-2xl bg-slate-50 border-none font-medium min-h-[120px] p-5 focus-visible:ring-2 focus-visible:ring-blue-500/20"
        />
      </div>
    </div>
  );
};