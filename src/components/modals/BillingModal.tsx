"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Calculator, Users, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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
  const [tenants, setTenants] = useState<any[]>([]);
  const queryClient = useQueryClient();
  
  const [type, setType] = useState('energia');
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [date, setDate] = useState(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);
  const [totalValue, setTotalValue] = useState('');
  const [billingMethod, setBillingMethod] = useState<'fixo' | 'por_pessoa' | 'consumo_kwh'>('fixo');
  
  const [prevReading, setPrevReading] = useState('');
  const [currReading, setCurrReading] = useState('');
  const [kwhPrice, setKwhPrice] = useState('0.95');
  
  const [residents, setResidents] = useState('1');
  const [status, setStatus] = useState('pendente');

  useEffect(() => {
    const fetchData = async () => {
      const [propsRes, tenantsRes] = await Promise.all([
        supabase.from('properties').select('id, name'),
        supabase.from('tenants').select('id, name, residents_count, property_id').eq('status', 'ativo')
      ]);
      setProperties(propsRes.data || []);
      setTenants(tenantsRes.data || []);
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    const fetchLastReading = async () => {
      if (type === 'energia' && billingMethod === 'consumo_kwh' && (tenantId || propertyId) && !isEdit) {
        let query = supabase
          .from('bills')
          .select('current_reading')
          .eq('type', 'energia')
          .not('current_reading', 'is', null)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(1);

        if (tenantId && tenantId !== 'none') query = query.eq('tenant_id', tenantId);
        if (propertyId) query = query.eq('property_id', propertyId);

        const { data } = await query;
        if (data && data.length > 0) {
          setPrevReading(data[0].current_reading.toString());
        } else {
          setPrevReading('0');
        }
      }
    };
    fetchLastReading();
  }, [tenantId, propertyId, type, billingMethod, isEdit]);

  useEffect(() => {
    if (isOpen && bill) {
      setType(bill.type || 'energia');
      setPropertyId(bill.property_id || '');
      setTenantId(bill.tenant_id || '');
      setDate(`${bill.year}-${bill.month}`);
      setTotalValue(bill.total_value?.toString() || '');
      setBillingMethod(bill.billing_method || 'fixo');
      setPrevReading(bill.previous_reading?.toString() || '');
      setCurrReading(bill.current_reading?.toString() || '');
      setKwhPrice(bill.kwh_price?.toString() || '0.95');
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

  const handleTenantChange = (id: string) => {
    setTenantId(id);
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
      if (tenant.residents_count) setResidents(tenant.residents_count.toString());
      if (tenant.property_id) setPropertyId(tenant.property_id);
    }
  };

  const calculated = useMemo(() => {
    if (billingMethod === 'consumo_kwh') {
      const prev = parseFloat(prevReading) || 0;
      const curr = parseFloat(currReading) || 0;
      const price = parseFloat(kwhPrice) || 0;
      const consumption = Math.max(0, curr - prev);
      return consumption * price;
    }
    const val = parseFloat(totalValue) || 0;
    if (billingMethod === 'por_pessoa') {
      const res = parseInt(residents) || 1;
      return res > 0 ? val / res : 0;
    }
    return val;
  }, [totalValue, billingMethod, residents, prevReading, currReading, kwhPrice]);

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
        property_id: propertyId || null,
        tenant_id: tenantId === 'none' ? null : (tenantId || null),
        month,
        year: parseInt(year),
        total_value: billingMethod === 'consumo_kwh' ? calculated : parseFloat(totalValue) || 0,
        calculated_value: calculated,
        billing_method: billingMethod,
        previous_reading: billingMethod === 'consumo_kwh' ? parseFloat(prevReading) : null,
        current_reading: billingMethod === 'consumo_kwh' ? parseFloat(currReading) : null,
        kwh_price: billingMethod === 'consumo_kwh' ? parseFloat(kwhPrice) : null,
        residents: billingMethod === 'por_pessoa' ? parseInt(residents) : null,
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
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
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Conta</Label>
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
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquilino</Label>
              <Select value={tenantId} onValueChange={handleTenantChange}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Método de Cobrança</Label>
            <Select value={billingMethod} onValueChange={(v: any) => setBillingMethod(v)}>
              <SelectTrigger className="h-14 rounded-2xl bg-blue-50/50 border-none font-black text-blue-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">Valor Fixo</SelectItem>
                <SelectItem value="por_pessoa">Rateio por Morador</SelectItem>
                <SelectItem value="consumo_kwh">Consumo (kWh)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {billingMethod === 'consumo_kwh' ? (
            <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100 space-y-4">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Cálculo de Energia</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-orange-600 uppercase">Anterior</Label>
                  <Input type="number" value={prevReading} onChange={e => setPrevReading(e.target.value)} className="h-10 rounded-xl bg-white border-orange-100 font-bold text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-orange-600 uppercase">Atual</Label>
                  <Input type="number" value={currReading} onChange={e => setCurrReading(e.target.value)} className="h-10 rounded-xl bg-white border-orange-100 font-bold text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-orange-600 uppercase">Preço kWh</Label>
                  <Input type="number" step="0.01" value={kwhPrice} onChange={e => setKwhPrice(e.target.value)} className="h-10 rounded-xl bg-white border-orange-100 font-bold text-center" />
                </div>
              </div>
              <p className="text-[10px] text-orange-400 font-medium italic text-center">
                Consumo: {Math.max(0, (parseFloat(currReading) || 0) - (parseFloat(prevReading) || 0))} kWh
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {billingMethod === 'por_pessoa' ? 'Valor Total Fatura' : 'Valor da Conta'}
                </Label>
                <Input type="number" step="0.01" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} placeholder="0,00" required className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
              </div>
              {billingMethod === 'por_pessoa' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº de Moradores</Label>
                  <Input type="number" value={residents} onChange={(e) => setResidents(e.target.value)} className="h-12 rounded-xl bg-blue-50/30 border-none font-bold" min="1" required />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mês/Ano Referência</Label>
              <Input type="month" value={date} onChange={(e) => setDate(e.target.value)} required className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</Label>
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

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor Final</p>
                <p className="text-xs text-slate-300 font-medium">
                  {billingMethod === 'por_pessoa' ? `Rateio p/ ${residents} pessoas` : 
                   billingMethod === 'consumo_kwh' ? 'Cálculo por consumo' : 'Valor fixo'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-400">
                R$ {calculated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
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