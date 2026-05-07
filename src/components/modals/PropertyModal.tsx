"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Camera, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Loader2,
  DollarSign,
  Home,
  Info,
  X,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
}

type Step = 'photo' | 'basic' | 'details' | 'address';

export const PropertyModal = ({ isOpen, onClose, property }: PropertyModalProps) => {
  const isEdit = !!property;
  const [step, setStep] = useState<Step>('photo');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    condo_fee: '0',
    block: '',
    tower: '',
    unit_number: '',
    floor: '',
    base_rent: '',
    image_url: '',
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
        condo_fee: (property.condo_fee || 0).toString(),
        block: property.block || '',
        tower: property.tower || '',
        unit_number: property.unit_number || '',
        floor: property.floor || '',
        base_rent: (property.base_rent || 0).toString(),
        image_url: property.image_url || '',
        status: property.status || 'disponivel'
      });
      setStep('photo');
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
        condo_fee: '0',
        block: '',
        tower: '',
        unit_number: '',
        floor: '',
        base_rent: '',
        image_url: '',
        status: 'disponivel'
      });
      setStep('photo');
    }
  }, [property, isOpen]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `property-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      showSuccess('Foto carregada com sucesso!');
    } catch (error: any) {
      showError('Erro ao carregar foto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...formData,
        user_id: user.id,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        parking_spots: parseInt(formData.parking_spots) || 0,
        size_sqm: parseFloat(formData.size_sqm) || 0,
        base_rent: parseFloat(formData.base_rent) || 0,
        condo_fee: parseFloat(formData.condo_fee) || 0
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

  const steps: Step[] = ['photo', 'basic', 'details', 'address'];
  const currentStepIndex = steps.indexOf(step);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
        {/* Header Premium */}
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {isEdit ? 'Editar Propriedade' : 'Nova Propriedade'}
                </DialogTitle>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Passo {currentStepIndex + 1} de {steps.length} • {
                    step === 'photo' ? 'Identidade Visual' :
                    step === 'basic' ? 'Informações Básicas' :
                    step === 'details' ? 'Características' : 'Localização'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 w-10 rounded-full transition-all duration-500",
                    i <= currentStepIndex ? "bg-blue-500 w-12" : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* Step 1: Photo & Identity */}
          {step === 'photo' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full aspect-video md:w-[500px] rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30 cursor-pointer",
                      formData.image_url && "border-none"
                    )}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-sm font-bold text-blue-600">Enviando arquivo...</p>
                      </div>
                    ) : formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                          <Camera className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-black text-slate-400 group-hover:text-blue-600">Clique para selecionar foto</p>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Galeria ou Computador</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  {formData.image_url && !isUploading && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({...formData, image_url: ''});
                      }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-red-500 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="w-full max-w-[500px] mt-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou use um link externo</span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      placeholder="https://exemplo.com/foto.jpg" 
                      value={formData.image_url}
                      onChange={e => setFormData({...formData, image_url: e.target.value})}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 'basic' && (
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
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="0,00"
                      value={formData.base_rent}
                      onChange={e => setFormData({...formData, base_rent: e.target.value})}
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
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
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
          )}

          {/* Step 4: Address */}
          {step === 'address' && (
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
          )}

          <DialogFooter className="pt-10 flex justify-between items-center sm:justify-between">
            {currentStepIndex > 0 ? (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={prevStep} 
                className="rounded-2xl font-black text-slate-400 hover:text-slate-900 h-14 px-8"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> Voltar
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="rounded-2xl font-black text-slate-400 hover:text-slate-900 h-14 px-8"
              >
                Cancelar
              </Button>
            )}

            {step !== 'address' ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 font-black h-14 gap-2 shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
              >
                Próximo Passo <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSave} 
                disabled={loading || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-12 font-black h-14 shadow-xl shadow-blue-200 gap-2 transition-all hover:scale-105 active:scale-95"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                {isEdit ? 'Salvar Alterações' : 'Finalizar Cadastro'}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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