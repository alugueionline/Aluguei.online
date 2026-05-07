"use client";

import React from 'react';
import { MapPin, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const AddressStep = ({ formData, setFormData }: AddressStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="w-3 h-3 text-blue-600" /> Endereço Completo
        </Label>
        <Input 
          placeholder="Rua, Número, Bairro, Cidade - UF" 
          value={formData.address}
          onChange={e => setFormData({...formData, address: e.target.value})}
          className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bloco/Torre</Label>
          <Input 
            placeholder="Ex: B" 
            value={formData.block}
            onChange={e => setFormData({...formData, block: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</Label>
          <Input 
            placeholder="Ex: 101" 
            value={formData.unit_number}
            onChange={e => setFormData({...formData, unit_number: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Andar</Label>
          <Input 
            placeholder="Ex: 10º" 
            value={formData.floor}
            onChange={e => setFormData({...formData, floor: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900"
          />
        </div>
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Quase lá!</p>
          <p className="text-[10px] text-slate-400 font-medium">Revise os dados antes de finalizar o cadastro premium.</p>
        </div>
      </div>
    </div>
  );
};