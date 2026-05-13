"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { DollarSign, Calendar, Building2, User, Loader2, Hash, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: any;
}

export const ContractModal = ({ isOpen, onClose, contract }: ContractModalProps) => {
  const isEdit = !!contract;
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    tenant_id: '',
    property_id: '',
    start_date: '',
    duration_months: '12',
    rent_value: '',
    status: 'ativo',
    due_day: '5'
  });

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [propsRes, tenantsRes] = await Promise.all([
        supabase.from('properties').select('id, name, base_rent'),
        supabase.from('tenants').select('id, name, due_day')
      ]);
      if (isMounted.current) {
        setProperties(propsRes.data || []);
        setTenants(tenantsRes.data || []);
      }
    };
    if (isOpen) {
      fetchData();
      if (contract) {
        setFormData({
          tenant_id: contract.tenant_id || '',
          property_id: contract.property_id || '',
          start_date: contract.start_date || '',
          duration_months: (contract.duration_months || 12).toString(),
          rent_value: (contract.rent_value || 0).toString(),
          status: contract.status || 'ativo',
          due_day: (contract.tenants?.due_day || 5).toString()
        });
      } else {
        setFormData({
          tenant_id: '',
          property_id: '',
          start_date: new Date().toISOString().split('T')[0],
          duration_months: '12',
          rent_value: '',
          status: 'ativo',
          due_day: '5'
        });
      }
    }
  }, [isOpen, contract]);

  const handlePropertyChange = (id: string) => {
    const prop = properties.find(p => p.id === id);
    setFormData(prev => ({ ...prev, property_id: id, rent_value: prop?.base_rent?.toString() || prev.rent_value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Payload do Contrato (sem due_day)
      const contractPayload = {
        user_id: user.id,
        tenant_id: formData.tenant_id,
        property_id: formData.property_id,
        start_date: formData.start_date,
        duration_months: parseInt(formData.duration_months),
        rent_value: parseFloat(formData.rent_value),
        status: formData.status
      };

      // 2. Salvar/Atualizar Contrato
      if (isEdit) {
        const { error } = await supabase.from('contracts').update(contractPayload).eq('id', contract.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contracts').insert([contractPayload]);
        if (error) throw error;
        // Se for novo contrato, marca imóvel como alugado
        await supabase.from('properties').update({ status: 'alugado' }).eq('id', formData.property_id);
      }

      // 3. Atualizar o dia de vencimento no Inquilino (onde a coluna realmente existe)
      if (formData.tenant_id) {
        await supabase
          .from('tenants')
          .update({ due_day: parseInt(formData.due_day) })
          .eq('id', formData.tenant_id);
      }

      showSuccess(isEdit ? 'Contrato atualizado!' : 'Contrato criado!');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      onClose();
    } catch (error: any) {
      showError('Erro ao salvar: ' + error.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8">
        <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">{isEdit ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inquilino</Label>
            <Select value={formData.tenant_id} onValueChange={v => setFormData({...formData, tenant_id: v})}>
              <SelectTrigger className="rounded-xl h-12 bg-gray-50 border-none font-bold"><div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-300" /><SelectValue placeholder="Selecione o inquilino" /></div></SelectTrigger>
              <SelectContent>{tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Imóvel</Label>
            <Select value={formData.property_id} onValueChange={handlePropertyChange}>
              <SelectTrigger className="rounded-xl h-12 bg-gray-50 border-none font-bold"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-300" /><SelectValue placeholder="Selecione o imóvel" /></div></SelectTrigger>
              <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor do Aluguel (R$)</Label>
              <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><Input type="number" step="0.01" value={formData.rent_value} onChange={e => setFormData(prev => ({...prev, rent_value: e.target.value}))} className="rounded-xl h-12 bg-gray-50 border-none font-bold pl-10" required /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Dia de Vencimento</Label>
              <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" /><Input type="number" min="1" max="31" value={formData.due_day} onChange={e => setFormData(prev => ({...prev, due_day: e.target.value}))} className="rounded-xl h-12 bg-blue-50/50 border-none font-bold pl-10 text-blue-900" required /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Início</Label>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><Input type="date" value={formData.start_date} onChange={e => setFormData(prev => ({...prev, start_date: e.target.value}))} className="rounded-xl h-12 bg-gray-50 border-none font-bold pl-10" required /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duração (Meses)</Label>
              <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><Input type="number" value={formData.duration_months} onChange={e => setFormData(prev => ({...prev, duration_months: e.target.value}))} className="rounded-xl h-12 bg-gray-50 border-none font-bold pl-10" required /></div>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-blue-100">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? 'Salvar Alterações' : 'Criar Contrato'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};