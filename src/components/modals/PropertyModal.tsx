"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StepIndicator } from './property-steps/StepIndicator';
import { PhotoStep } from './property-steps/PhotoStep';
import { BasicStep } from './property-steps/BasicStep';
import { DetailsStep } from './property-steps/DetailsStep';
import { AddressStep } from './property-steps/AddressStep';

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

  const propertyId = property?.id;

  useEffect(() => {
    if (isOpen) {
      if (property) {
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
      } else {
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
      }
      setStep('photo');
    }
  }, [isOpen, propertyId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newBaseRent = parseFloat(formData.base_rent) || 0;

      const payload = {
        ...formData,
        user_id: user.id,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        parking_spots: parseInt(formData.parking_spots) || 0,
        size_sqm: parseFloat(formData.size_sqm) || 0,
        base_rent: newBaseRent,
        condo_fee: parseFloat(formData.condo_fee) || 0
      };

      if (isEdit) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id);
        if (error) throw error;

        // SINCRONIZAÇÃO: Se o aluguel mudou, atualiza contratos ativos
        if (property.base_rent !== newBaseRent) {
          await supabase
            .from('contracts')
            .update({ rent_value: newBaseRent })
            .eq('property_id', property.id)
            .eq('status', 'ativo');
          
          showSuccess('Imóvel e contratos ativos atualizados!');
        } else {
          showSuccess('Imóvel atualizado com sucesso!');
        }
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
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {isEdit ? 'Editar Propriedade' : 'Nova Propriedade'}
                </h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Passo {currentStepIndex + 1} de {steps.length} • {
                    step === 'photo' ? 'Identidade Visual' :
                    step === 'basic' ? 'Informações Básicas' :
                    step === 'details' ? 'Características' : 'Localização'
                  }
                </p>
              </div>
            </div>
            <StepIndicator currentStepIndex={currentStepIndex} totalSteps={steps.length} />
          </div>
        </div>

        <div className="p-10">
          <div className="min-h-[350px]">
            {step === 'photo' && (
              <PhotoStep 
                imageUrl={formData.image_url} 
                isUploading={isUploading} 
                setIsUploading={setIsUploading} 
                onChange={(url) => setFormData(prev => ({...prev, image_url: url}))} 
              />
            )}

            {step === 'basic' && (
              <BasicStep formData={formData} setFormData={setFormData} />
            )}

            {step === 'details' && (
              <DetailsStep formData={formData} setFormData={setFormData} />
            )}

            {step === 'address' && (
              <AddressStep formData={formData} setFormData={setFormData} />
            )}
          </div>

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