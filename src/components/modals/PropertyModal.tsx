"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { 
  Building2, 
  MapPin, 
  Info, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
}

type Step = 'basic' | 'details' | 'address';

export const PropertyModal = ({ isOpen, onClose, property }: PropertyModalProps) => {
  const isEdit = !!property;
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'apartamento',
    description: '',
    bedrooms: '0',
    bathrooms: '0',
    parking_spots: '0',
    size_sqm: '0',
    address: '',
    condo_name: '',
    block: '',
    tower: '',
    unit_number: '',
    floor: '',
    base_rent: '',
    status: 'disponivel'
  });

  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        name: property.name || '',
        type: property.type || 'apartamento',
        description: property.description || '',
        bedrooms: (property.bedrooms || 0).toString(),
        bathrooms: (property.bathrooms || 0).toString(),
        parking_spots: (property.parking_spots || 0).toString(),
        size_sqm: (property.size_sqm || 0).toString(),
        address: property.address || '',
        condo_name: property.condo_name || '',
        block: property.block || '',
        tower: property.tower || '',
        unit_number: property.unit_number || '',
        floor: property.floor || '',
        base_rent: (property.base_rent || 0).toString(),
        status: property.status || 'disponivel'
      });
      setStep('basic');
    } else if (isOpen) {
      setFormData({
        name: '',
        type: 'apartamento',
        description: '',
        bedrooms: '0',
        bathrooms: '0',
        parking_spots: '0',
        size_sqm: '0',
        address: '',
        condo_name: '',
        block: '',
        tower: '',
        unit_number: '',
        floor: '',
        base_rent: '',
        status: 'disponivel'
      });
      setStep('basic');
    }
  }, [property, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...formData,
        user_id: user.id,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        parking_spots: parseInt(formData.parking_spots),
        size_sqm: parseFloat(formData.size_sqm),
        base_rent: parseFloat(formData.base_rent)
      };

      if (isEdit) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id);
        if (error) throw error;
        showSuccess('Imóvel atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([payload]);
        if (error) throw error;
        showSuccess('Imóvel cadastrado com sucesso!');
      }
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 'basic') setStep('details');
    else if (step === 'details') setStep('address');
  };

  const prevStep = () => {
    if (step === 'details') setStep('basic');
    else if (step === 'address') setStep('details');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">
                  {isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
                </DialogTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Passo {step === 'basic' ? '1' : step === 'details' ? '2' : '3'} de 3</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 w-8 rounded-full transition-all",
                    (step === 'basic' && i === 1) || (step === 'details' && i <= 2) || (step === 'address' && i <= 3)
                      ? "bg-blue-600" 
                      : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          {step === 'basic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação do Imóvel</Label>
                <Input 
                  placeholder="Ex: Apto 101 - Edifício Central" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="kitnet">Kitnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel Base (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0,00"
                    value={formData.base_rent}
                    onChange={e => setFormData({...formData, base_rent: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Curta</Label>
                <Textarea 
                  placeholder="Detalhes que ajudam na identificação..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="rounded-xl bg-slate-50 border-none font-medium min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Bed className="w-3 h-3" /> Quartos
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.bedrooms}
                    onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Bath className="w-3 h-3" /> Banheiros
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.bathrooms}
                    onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Car className="w-3 h-3" /> Vagas Garagem
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.parking_spots}
                    onChange={e => setFormData({...formData, parking_spots: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Maximize className="w-3 h-3" /> Área (m²)
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.size_sqm}
                    onChange={e => setFormData({...formData, size_sqm: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-800 leading-relaxed">
                  Essas informações ajudam a valorizar o imóvel e facilitam a geração de anúncios e contratos automáticos.
                </p>
              </div>
            </div>
          )}

          {step === 'address' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Endereço Completo
                </Label>
                <Input 
                  placeholder="Rua, Número, Bairro, Cidade" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Condomínio (Opcional)</Label>
                <Input 
                  placeholder="Ex: Residencial das Palmeiras" 
                  value={formData.condo_name}
                  onChange={e => setFormData({...formData, condo_name: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bloco/Torre</Label>
                  <Input 
                    placeholder="Ex: B" 
                    value={formData.block}
                    onChange={e => setFormData({...formData, block: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</Label>
                  <Input 
                    placeholder="Ex: 101" 
                    value={formData.unit_number}
                    onChange={e => setFormData({...formData, unit_number: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Andar</Label>
                  <Input 
                    placeholder="Ex: 10º" 
                    value={formData.floor}
                    onChange={e => setFormData({...formData, floor: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-8 flex justify-between items-center">
            {step !== 'basic' ? (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={prevStep} 
                className="rounded-xl font-bold text-slate-400 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="rounded-xl font-bold text-slate-400 hover:text-slate-900"
              >
                Cancelar
              </Button>
            )}

            {step !== 'address' ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 font-bold h-12 gap-2"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSave} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100 gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isEdit ? 'Salvar Alterações' : 'Finalizar Cadastro'}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};