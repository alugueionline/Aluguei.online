"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Loader2, User, Home, DollarSign, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInMonths, parseISO } from 'date-fns';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: any;
}

export const ContractModal = ({ isOpen, onClose, contract }: ContractModalProps) => {
  const isEdit = !!contract;
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    tenant_id: '',
    property_id: '',
    start_date: '',
    duration_months: '12',
    rent_value: '',
    status: 'ativo'
  });

  // Carregar Inquilinos e Imóveis
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar todos os inquilinos
      const { data: t } = await supabase
        .from('tenants')
        .select('id, name, contract_start_date, contract_end_date, property_id')
        .eq('user_id', user.id);

      // Buscar TODOS os imóveis (sem filtrar por disponível para evitar que sumam)
      const { data: p } = await supabase
        .from('properties')
        .select('id, name, base_rent, status')
        .eq('user_id', user.id);
        
      setTenants(t || []);
      setProperties(p || []);
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
          status: contract.status || 'ativo'
        });
      } else {
        setFormData({
          tenant_id: '',
          property_id: '',
          start_date: '',
          duration_months: '12',
          rent_value: '',
          status: 'ativo'
        });
      }
    }
  }, [isOpen, contract]);

  // Puxar dados do inquilino quando selecionado
  const handleTenantChange = (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      let duration = '12';
      if (selectedTenant.contract_start_date && selectedTenant.contract_end_date) {
        const start = parseISO(selectedTenant.contract_start_date);
        const end = parseISO(selectedTenant.contract_end_date);
        duration = Math.abs(differenceInMonths(end, start)).toString();
      }

      const linkedProperty = properties.find(p => p.id === selectedTenant.property_id);

      setFormData(prev => ({
        ...prev,
        tenant_id: tenantId,
        property_id: selectedTenant.property_id || prev.property_id,
        start_date: selectedTenant.contract_start_date || prev.start_date,
        duration_months: duration,
        rent_value: linkedProperty?.base_rent?.toString() || prev.rent_value
      }));
      
      if (selectedTenant.property_id) {
        showSuccess(`Dados de ${selectedTenant.name} carregados!`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const payload = {
        ...formData,
        user_id: user.id,
        rent_value: parseFloat(formData.rent_value) || 0,
        duration_months: parseInt(formData.duration_months) || 12
      };

      if (isEdit) {
        // Se mudou o imóvel, liberar o antigo e ocupar o novo
        if (contract.property_id !== formData.property_id) {
          if (contract.property_id) await supabase.from('properties').update({ status: 'disponivel' }).eq('id', contract.property_id);
          await supabase.from('properties').update({ status: 'alugado' }).eq('id', formData.property_id);
        }

        const { error } = await supabase
          .from('contracts')
          .update(payload)
          .eq('id', contract.id);
        
        if (error) throw error;
        showSuccess('Contrato atualizado!');
      } else {
        const { error: contractError } = await supabase.from('contracts').insert([payload]);
        if (contractError) throw contractError;

        // Garantir que o imóvel e o inquilino estejam sincronizados
        await supabase.from('properties').update({ status: 'alugado' }).eq('id', formData.property_id);
        await supabase.from('tenants').update({ property_id: formData.property_id }).eq('id', formData.tenant_id);

        showSuccess('Contrato gerado com sucesso!');
      }

      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8 border-none shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
            {isEdit ? 'Editar Contrato' : 'Novo Contrato de Locação'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-blue-800 leading-relaxed">
              Selecione o inquilino primeiro para carregar automaticamente as datas e o imóvel que você já cadastrou.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilino</Label>
              <Select value={formData.tenant_id} onValueChange={handleTenantChange} required>
                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-300" />
                    <SelectValue placeholder="Selecionar..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel</Label>
              <Select value={formData.property_id} onValueChange={v => {
                const p = properties.find(prop => prop.id === v);
                setFormData({...formData, property_id: v, rent_value: p?.base_rent?.toString() || formData.rent_value});
              }} required>
                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-300" />
                    <SelectValue placeholder="Selecionar..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.status === 'alugado' ? '(Locado)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Início</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  type="date" 
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  required 
                  className="rounded-xl h-12 bg-slate-50 border-none font-bold pl-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração (Meses)</Label>
              <Input 
                type="number" 
                value={formData.duration_months}
                onChange={e => setFormData({...formData, duration_months: e.target.value})}
                required 
                className="rounded-xl h-12 bg-slate-50 border-none font-bold" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Aluguel (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.rent_value}
                  onChange={e => setFormData({...formData, rent_value: e.target.value})}
                  placeholder="0,00" 
                  required 
                  className="rounded-xl h-12 bg-slate-50 border-none font-bold pl-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? 'Salvar Alterações' : 'Gerar Contrato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};