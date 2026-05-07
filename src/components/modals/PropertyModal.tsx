"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Camera, X, UploadCloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
}

export const PropertyModal = ({ isOpen, onClose, property }: PropertyModalProps) => {
  const isEdit = !!property;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(property?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'apartamento',
    address: '',
    base_rent: '',
    status: 'disponivel'
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        type: property.type,
        address: property.address,
        base_rent: property.base_rent.toString(),
        status: property.status
      });
      setImagePreview(property.image_url);
    } else {
      setFormData({
        name: '',
        type: 'apartamento',
        address: '',
        base_rent: '',
        status: 'disponivel'
      });
      setImagePreview(null);
    }
  }, [property, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...formData,
        user_id: user.id,
        base_rent: parseFloat(formData.base_rent),
        image_url: imagePreview
      };

      if (isEdit) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id);
        if (error) throw error;
        showSuccess('Imóvel atualizado!');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([payload]);
        if (error) throw error;
        showSuccess('Imóvel cadastrado no seu workspace!');
      }
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">{isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome / Identificação</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
                className="rounded-xl h-12" 
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
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
            <Label>Endereço Completo</Label>
            <Input 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              required 
              className="rounded-xl h-12" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aluguel Base (R$)</Label>
              <Input 
                type="number" 
                value={formData.base_rent}
                onChange={e => setFormData({...formData, base_rent: e.target.value})}
                required 
                className="rounded-xl h-12" 
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
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
            <Button type="submit" disabled={loading} className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12">
              {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};