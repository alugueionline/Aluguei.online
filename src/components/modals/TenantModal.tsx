"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Loader2, User, DollarSign, Hash } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { addMonths, format, parseISO, isValid } from 'date-fns';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: any;
}

export const TenantModal = ({ isOpen, onClose, tenant }: TenantModalProps) => {
  const isEdit = !!tenant;
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    property_id: '',
    status: 'ativo',
    contract_start_date: '',
    contract_end_date: '',
    duration_months: '12',
    due_day: '5'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('id, name, status');
      setProperties(data || []);
    };

    if (isOpen) {
      fetchProperties();
      if (tenant) {
        setFormData({
          name: tenant.name || '',
          cpf: tenant.cpf || '',
          phone: tenant.phone || '',
          email: tenant.email || '',
          property_id: tenant.property_id || '',
          status: tenant.status || 'ativo',
          contract_start_date: tenant.contract_start_date || '',
          contract_end_date: tenant.contract_end_date || '',
          duration_months: '12', // Valor padrão para edição se não existir
          due_day: (tenant.due_day || 5).toString()
        });
      } else {
        setFormData({
          name: '',
          cpf: '',
          phone: '',
          email: '',
          property_id: '',
          status: 'ativo',
          contract_start_date: '',
          contract_end_date: '',
          duration_months: '12',
          due_day: '5'
        });
      }
    }
  }, [isOpen, tenant]);

  // Cálculo automático da data de término
  useEffect(() => {
    if (formData.contract_start_date && formData.duration_months) {
      const startDate = parseISO(formData.contract_start_date);
      const months = parseInt(formData.duration_months);
      
      if (isValid(startDate) && !isNaN(months)) {
        const endDate = addMonths(startDate, months);
        setFormData(prev => ({
          ...prev,
          contract_end_date: format(endDate, 'yyyy-MM-dd')
        }));
      }
    }
  }, [formData.contract_start_date, formData.duration_months]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const payload = {
        name: formData.name,
        cpf: formData.cpf,
        phone: formData.phone,
        email: formData.email,
        property_id: formData.property_id === 'none' ? null : (formData.property_id || null),
        status: formData.status,
        contract_start_date: formData.contract_start_date || null,
        contract_end_date: formData.contract_end_date || null,
        due_day: parseInt(formData.due_day) || 5,
        user_id: user.id
      };

      if (isEdit) {
        const { error } = await supabase.from('tenants').update(payload).eq('id', tenant.id);
        if (error) throw error;
        
        if (payload.property_id) {
          await supabase.from('properties').update({ status: 'alugado' }).eq('id', payload.property_id);
        }
        
        showSuccess('Inquilino atualizado!');
      } else {
        const { error } = await supabase.from('tenants').insert([payload]);
        if (error) throw error;

        if (payload.property_id) {
          await supabase.from('properties').update({ status: 'alugado' }).eq('id', payload.property_id);
        }

        showSuccess('Inquilino cadastrado com sucesso!');
      }

      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties-preview'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      showError('Erro ao salvar: ' + (error.message || 'Verifique os campos e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEdit ? 'Editar Inquilino' : 'Novo Inquilino'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</Label>
            <Input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
              className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF</Label>
              <Input 
                placeholder="000.000.000-00" 
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                className="rounded-xl h-12 bg-gray-50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</Label>
              <Input 
                placeholder="(00) 00000-0000" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="rounded-xl h-12 bg-gray-50 border-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Imóvel Vinculado</Label>
              <Select 
                value={formData.property_id || 'none'} 
                onValueChange={v => setFormData({...formData, property_id: v})}
              >
                <SelectTrigger className="rounded-xl h-12 bg-blue-50/50 border-none font-bold text-blue-900">
                  <SelectValue placeholder="Selecione um imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum imóvel</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.status === 'alugado' && p.id !== tenant?.property_id ? '(Locado)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Dia de Vencimento</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <Input 
                  type="number"
                  min="1"
                  max="31"
                  value={formData.due_day}
                  onChange={e => setFormData({...formData, due_day: e.target.value})}
                  className="rounded-xl h-12 bg-emerald-50/30 border-none font-bold pl-10"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-widest">Vigência do Contrato</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Início</Label>
                <Input 
                  type="date"
                  value={formData.contract_start_date}
                  onChange={e => setFormData({...formData, contract_start_date: e.target.value})}
                  className="h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Meses</Label>
                <div className="relative">
                  <Hash className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                  <Input 
                    type="number"
                    value={formData.duration_months}
                    onChange={e => setFormData({...formData, duration_months: e.target.value})}
                    className="h-10 pl-7 rounded-xl bg-white border-slate-200 font-bold text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Término</Label>
                <Input 
                  type="date"
                  value={formData.contract_end_date}
                  onChange={e => setFormData({...formData, contract_end_date: e.target.value})}
                  className="h-10 rounded-xl bg-white border-slate-200 font-bold text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Inquilino'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};