"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { DollarSign, Calendar, Building2, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const TransactionModal = ({ isOpen, onClose, onSave }: TransactionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [propsRes, tenantsRes] = await Promise.all([
        supabase.from('properties').select('id, name'),
        supabase.from('tenants').select('id, name')
      ]);
      setProperties(propsRes.data || []);
      setTenants(tenantsRes.data || []);
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const propertyId = formData.get('property') as string;
    const tenantId = formData.get('tenant') as string;
    const value = parseFloat(formData.get('value') as string);
    const dateStr = formData.get('date') as string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const [year, month, day] = dateStr.split('-');

      const payload = {
        user_id: user.id,
        property_id: propertyId,
        tenant_id: tenantId === 'none' ? null : tenantId,
        type: category === 'Aluguel' ? 'aluguel' : type, // Mapeia para tipos do dashboard
        month,
        year: parseInt(year),
        total_value: value,
        calculated_value: value,
        status: 'pago' // Transações manuais geralmente já são pagas
      };

      const { error } = await supabase.from('bills').insert([payload]);
      if (error) throw error;

      showSuccess('Transação registrada com sucesso!');
      onSave(payload);
      onClose();
    } catch (err: any) {
      showError('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Tipo</Label>
              <Select name="type" defaultValue="receita">
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita (+)</SelectItem>
                  <SelectItem value="despesa">Despesa (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Categoria</Label>
              <Select name="category" defaultValue="Aluguel">
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="IPTU">IPTU</SelectItem>
                  <SelectItem value="Condomínio">Condomínio</SelectItem>
                  <SelectItem value="Taxa Extra">Taxa Extra</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">Imóvel</Label>
            <Select name="property" required>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-300" />
                  <SelectValue placeholder="Selecione o imóvel" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">Inquilino</Label>
            <Select name="tenant" defaultValue="none">
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-300" />
                  <SelectValue placeholder="Selecione o inquilino" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum / Outros</SelectItem>
                {tenants.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Valor (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input name="value" type="number" step="0.01" placeholder="0,00" className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold" required />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Transação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};