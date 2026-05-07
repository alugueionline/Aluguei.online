"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property } from '@/types/rental';
import { showSuccess } from '@/utils/toast';
import { Camera, X, UploadCloud } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
}

export const PropertyModal = ({ isOpen, onClose, property }: PropertyModalProps) => {
  const isEdit = !!property;
  const [imagePreview, setImagePreview] = useState<string | null>(property?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(isEdit ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">{isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          {/* Upload de Foto */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">Foto do Imóvel</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative h-40 w-full rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 text-blue-600">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Clique para enviar uma foto</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP (Máx. 5MB)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Identificação</Label>
              <Input id="name" placeholder="Ex: Apto 101" defaultValue={property?.name} required className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select defaultValue={property?.type || 'apartamento'}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="kitnet">Kitnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input id="address" placeholder="Rua, número, bairro..." defaultValue={property?.address} required className="rounded-xl h-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Aluguel Base (R$)</Label>
              <Input id="rent" type="number" placeholder="0,00" defaultValue={property?.baseRent} required className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status Inicial</Label>
              <Select defaultValue={property?.status || 'disponivel'}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="alugado">Alugado</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12 shadow-lg shadow-blue-100">
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};