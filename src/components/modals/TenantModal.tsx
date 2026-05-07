"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: any;
}

export const TenantModal = ({ isOpen, onClose, tenant }: TenantModalProps) => {
  const isEdit = !!tenant;
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    property_id: '',
    status: 'ativo'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('id, name');
      setProperties(data || []);
    };

    if (isOpen) {
      fetchProperties();
      if (tenant) {
        setFormData({
          name: tenant.name,
          cpf: tenant.cpf || '',
          phone: tenant.phone || '',
          email: tenant.email || '',
          property_id: tenant.property_id || '',
          status: tenant.status
        });
      } else {
        setFormData({
          name: '',
          cpf: '',
          phone: '',
          email: '',
          property_id: '',
          status: 'ativo'
        });
      }
    }
  }, [isOpen, tenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const payload = {
        ...formData,
        user_id: user.id,
        property_id: formData.property_id || null
      };

      if (isEdit) {
        const { error } = await supabase.from('tenants').update(payload).eq('id', tenant.id);
        if (error) throw error;
        showSuccess('Inquilino atualizado!');
      } else {
        const { error } = await supabase.from('tenants').insert([payload]);
        if (error) throw error;
        showSuccess('Inquilino cadastrado com sucesso!');
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
          <DialogTitle className="text-2xl font-black tracking-tight">{isEdit ? 'Editar Inquilino' : 'Novo Inquilino'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Nome Completo</Label>
            <Input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
              className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400 ml-1">CPF</Label>
              <Input 
                placeholder="000.000.000-00" 
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                className="rounded-xl h-12 bg-gray-50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Telefone</Label>
              <Input 
                placeholder="(00) 00000-0000" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="rounded-xl h-12 bg-gray-50 border-none font-bold"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Imóvel Vinculado</Label>
            <Select 
              value={formData.property_id} 
              onValueChange={v => setFormData({...formData, property_id: v})}
            >
              <SelectTrigger className="rounded-xl h-12 bg-gray-50 border-none font-bold">
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12 shadow-lg shadow-blue-100">
              {loading ? 'Salvando...' : 'Salvar Inquilino'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};