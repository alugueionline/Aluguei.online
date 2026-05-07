"use client";

import React from 'react';
import { Bed, Bath, Car, Maximize, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DetailsStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DetailInput = ({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </Label>
    <Input 
      type="number" 
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-14 rounded-2xl bg-slate-50 border-none font-black text-slate-900 text-center text-lg focus-visible:ring-2 focus-visible:ring-blue-500/20"
    />
  </div>
);

export const DetailsStep = ({ formData, setFormData }: DetailsStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DetailInput 
          icon={<Bed className="w-4 h-4" />} 
          label="Quartos" 
          value={formData.bedrooms} 
          onChange={v => setFormData({...formData, bedrooms: v})} 
        />
        <DetailInput 
          icon={<Bath className="w-4 h-4" />} 
          label="Banheiros" 
          value={formData.bathrooms} 
          onChange={v => setFormData({...formData, bathrooms: v})} 
        />
        <DetailInput 
          icon={<Car className="w-4 h-4" />} 
          label="Vagas" 
          value={formData.parking_spots} 
          onChange={v => setFormData({...formData, parking_spots: v})} 
        />
        <DetailInput 
          icon={<Maximize className="w-4 h-4" />} 
          label="Área (m²)" 
          value={formData.size_sqm} 
          onChange={v => setFormData({...formData, size_sqm: v})} 
        />
      </div>

      <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-black text-blue-900 tracking-tight">Custos de Condomínio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nome do Condomínio</Label>
            <Input 
              placeholder="Ex: Residencial das Palmeiras" 
              value={formData.condo_name}
              onChange={e => setFormData({...formData, condo_name: e.target.value})}
              className="h-12 rounded-xl bg-white border-none font-bold text-slate-900 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Valor Mensal (R$)</Label>
            <Input 
              type="number" 
              placeholder="0,00"
              value={formData.condo_fee}
              onChange={e => setFormData({...formData, condo_fee: e.target.value})}
              className="h-12 rounded-xl bg-white border-none font-black text-slate-900 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};