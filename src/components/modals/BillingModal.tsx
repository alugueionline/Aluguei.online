"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Calculator, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  bill?: any;
}

export const BillingModal = ({ isOpen, onClose, onSave, bill }: BillingModalProps) => {
  const isEdit = !!bill;
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  const [type, setType] = useState('energia');
  const [propertyId, setPropertyId] = useState('');
  const [date, setDate] = useState(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);
  const [totalValue, setTotalValue] = useState('');
  const [billingMethod, setBillingMethod] = useState<'fixo' | 'por_pessoa'>('fixo');
  const [residents, setResidents] = useState('1');
  const [calculated, setCalculated] = useState<number>(0);
  const [status, setStatus] = useState('pendente');

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('id, name');
      setProperties(data || []);
      if (data && data.length > 0 && !propertyId) setPropertyId(data[0].id);
    };
    if (isOpen) fetchProperties();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && bill) {
      setType(bill.type || 'energia');
      setPropertyId(bill.property_id || '');
      setDate(`${bill.year}-${bill.month}`);
      setTotalValue(bill.total_value?.toString() || '');
      setBillingMethod(bill.billing_method || 'fixo');
      setResidents(bill.residents?.toString() || '1');
      setStatus(bill.status || 'pendente');
    } else if (isOpen && !bill) {
      setType('energia');
      setTotalValue('');
      setBillingMethod('fixo');
      setResidents('1');
      setStatus('pendente');
    }
  }, [isOpen, bill]);

  useEffect(() => {
    const val = parseFloat(totalValue) || 0;
    const res = parseInt(residents) || 1;
    
    if (billingMethod === 'por_pessoa') {
      setCalculated(val / res);
    } else {
      setCalculated(val);
    }
  }, [totalValue, billingMethod, residents]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const [year, month] = date.split('-');
      
      const payload = {
        user_id: user.id,
        type,
        property_id: propertyId,
        month,
        year: parseInt(year),
        total_value: parseFloat(totalValue),
        calculated_value: calculated,
        status
      };

      if (isEdit) {
        const { error } = await supabase.from('bills').update(payload).eq('id', bill.id);
        if (error) throw error;
        showSuccess('Lançamento atualizado!');
      } else {
        const { error } = await supabase.from('bills').insert([payload]);
        if (error) throw error;
        showSuccess('Lançamento realizado com sucesso!');
      }

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
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Conta</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="iptu">IPTU</SelectItem>
                  <SelectItem value="extra">Taxa Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Cobrança</Label>
              <Select value={billingMethod} onValueChange={(v: any) => setBillingMethod(v)}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Valor Fixo</SelectItem>
                  <SelectItem value="por_pessoa">Rateio por Pessoa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês/Ano Referência</Label>
              <Input 
                type="month" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {billingMethod === 'por_pessoa' ? 'Valor Total Fatura' : 'Valor da Conta'}
              </Label>
              <Input 
                type="number" 
                step="0.01"
                value={totalValue} 
                onChange={(e) => setTotalValue(e.target.value)} 
                placeholder="0,00" 
                required 
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {billingMethod === 'por_pessoa' && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº de Residentes</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="number" 
                  value={residents} 
                  onChange={(e) => setResidents(e.target.value)} 
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-bold"
                  min="1"
                  required 
                />
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-blue-700">
              <Calculator className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">
                {billingMethod === 'por_pessoa' ? 'Valor por Pessoa' : 'Valor Calculado'}
              </span>
            </div>
            <span className="text-lg font-black text-blue-900">R$ {calculated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};