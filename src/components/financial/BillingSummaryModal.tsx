"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Copy, Send, Calculator, Landmark, Trash2, Plus, Search, Loader2, X, Zap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface ExtraValue {
  label: string;
  value: string;
  quantity?: string;
  unitPrice?: string;
}

interface BillingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
}

export const BillingSummaryModal = ({ isOpen, onClose, tenantId }: BillingSummaryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [pixKey, setPixKey] = useState('seu-pix@email.com');
  const [rentValue, setRentValue] = useState('0');
  const [fineValue, setFineValue] = useState('0');
  const [interestValue, setInterestValue] = useState('0');
  const [extraValues, setExtraValues] = useState<ExtraValue[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [tenantsRes, userRes] = await Promise.all([
        supabase.from('tenants').select('id, name, phone').eq('status', 'ativo'),
        supabase.auth.getUser()
      ]);
      setTenants(tenantsRes.data || []);
      if (userRes.data.user?.user_metadata?.pix_key) setPixKey(userRes.data.user.user_metadata.pix_key);
      setLoading(false);
      if (tenantId) handleSelectTenant(tenantId, tenantsRes.data || []);
    };
    if (isOpen) fetchInitialData();
  }, [isOpen, tenantId]);

  const handleSelectTenant = async (id: string, currentTenants?: any[]) => {
    setSelectedTenantId(id);
    try {
      setLoading(true);
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      // Buscamos as contas incluindo campos de consumo que podem ter sido preenchidos no "Dividir Conta"
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('tenant_id', id);
        
      const { data: contracts } = await supabase
        .from('contracts')
        .select('rent_value')
        .eq('tenant_id', id)
        .eq('status', 'ativo');

      let totalRent = 0;
      const extras: ExtraValue[] = [];
      const hasRentBillThisMonth = bills?.some(b => b.type === 'aluguel' && b.month === currentMonth && b.year === currentYear);

      bills?.filter(b => b.status !== 'pago').forEach(b => {
        const val = Number(b.calculated_value || b.total_value || 0);
        if (b.type === 'aluguel' && b.month === currentMonth && b.year === currentYear) {
          totalRent += val;
          setFineValue((b.fine_value || 0).toString());
          setInterestValue((b.interest_value || 0).toString());
        } else {
          // Aqui puxamos os valores de consumo (kWh) e preço unitário se existirem no banco
          extras.push({
            label: `${b.type.charAt(0).toUpperCase() + b.type.slice(1)} (${b.month}/${b.year})`,
            value: val.toString(),
            quantity: b.consumption?.toString() || '', // Puxa do banco
            unitPrice: b.unit_price?.toString() || ''  // Puxa do banco
          });
        }
      });

      if (!hasRentBillThisMonth) {
        contracts?.forEach(c => totalRent += Number(c.rent_value || 0));
        setFineValue('0');
        setInterestValue('0');
      }

      setRentValue(totalRent.toString());
      setExtraValues(extras);
    } catch (err) {
      showError('Erro ao carregar débitos.');
    } finally {
      setLoading(false);
    }
  };

  const updateExtra = (index: number, field: keyof ExtraValue, val: string) => {
    const newExtras = [...extraValues];
    newExtras[index] = { ...newExtras[index], [field]: val };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(newExtras[index].quantity || '0');
      const p = parseFloat(newExtras[index].unitPrice || '0');
      if (q > 0 && p > 0) {
        newExtras[index].value = (q * p).toFixed(2);
      }
    }
    setExtraValues(newExtras);
  };

  const total = useMemo(() => {
    const rent = parseFloat(rentValue) || 0;
    const fine = parseFloat(fineValue) || 0;
    const interest = parseFloat(interestValue) || 0;
    const extras = extraValues.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
    return rent + fine + interest + extras;
  }, [rentValue, fineValue, interestValue, extraValues]);

  const generatedMessage = useMemo(() => {
    const tenantObj = tenants.find(t => t.id === selectedTenantId);
    const rent = parseFloat(rentValue) || 0;
    const fine = parseFloat(fineValue) || 0;
    const interest = parseFloat(interestValue) || 0;
    
    let details = '';
    if (rent > 0) details += `• *Aluguel:* R$ ${rent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (fine > 0) details += `• *Multa:* R$ ${fine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (interest > 0) details += `• *Juros:* R$ ${interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    extraValues.forEach(e => {
      const val = parseFloat(e.value) || 0;
      if (val > 0) {
        const consumptionInfo = (e.quantity && e.unitPrice) ? ` (${e.quantity} kWh x R$ ${e.unitPrice})` : '';
        details += `• *${e.label}:* R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${consumptionInfo}\n`;
      }
    });

    return `Olá ${tenantObj?.name || 'Inquilino'}! 👋\n\nEstou enviando o resumo do aluguel e demais valores pendentes:\n\n${details}\n💰 *Total a pagar: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n🔑 *Chave PIX:* ${pixKey}\n\nQualquer dúvida, estou à disposição!`;
  }, [selectedTenantId, rentValue, fineValue, interestValue, extraValues, pixKey, total, tenants]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[900px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col md:grid md:grid-cols-2 h-[90vh] md:h-[750px]">
          <div className="p-6 md:p-8 space-y-6 bg-white overflow-y-auto">
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Cobrança Detalhada</DialogTitle>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Inquilino</Label>
                <Select onValueChange={(v) => handleSelectTenant(v)} value={selectedTenantId}>
                  <SelectTrigger className="h-12 rounded-xl bg-blue-50/50 border-blue-100 font-bold text-blue-900">
                    <div className="flex items-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <SelectValue placeholder="Escolha um inquilino..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>{tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel (R$)</Label>
                  <Input type="number" className="h-11 rounded-xl bg-slate-50 border-none font-bold" value={rentValue} onChange={(e) => setRentValue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Multa/Juros (R$)</Label>
                  <div className="flex gap-2">
                    <Input type="number" className="h-11 rounded-xl bg-rose-50/50 border-none font-bold text-rose-700" value={fineValue} onChange={(e) => setFineValue(e.target.value)} placeholder="Multa" />
                    <Input type="number" className="h-11 rounded-xl bg-rose-50/50 border-none font-bold text-rose-700" value={interestValue} onChange={(e) => setInterestValue(e.target.value)} placeholder="Juros" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outros Débitos / Energia</Label>
                  <Button variant="ghost" size="sm" onClick={() => setExtraValues([...extraValues, { label: '', value: '0' }])} className="h-6 px-2 text-blue-600 font-bold text-[10px]">
                    <Plus className="w-3 h-3 mr-1" /> ADICIONAR
                  </Button>
                </div>
                
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {extraValues.map((extra, index) => (
                    <div key={index} className="p-3 rounded-2xl bg-slate-50 space-y-3 border border-slate-100">
                      <div className="flex gap-2">
                        <Input placeholder="Ex: Energia" className="h-9 rounded-lg bg-white border-slate-200 text-xs font-bold flex-1" value={extra.label} onChange={(e) => updateExtra(index, 'label', e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => setExtraValues(extraValues.filter((_, i) => i !== index))} className="h-9 w-9 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">kWh</Label>
                          <Input type="number" placeholder="Qtd" className="h-8 rounded-lg bg-white border-slate-200 text-xs" value={extra.quantity || ''} onChange={(e) => updateExtra(index, 'quantity', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Preço Unit.</Label>
                          <Input type="number" placeholder="R$" className="h-8 rounded-lg bg-white border-slate-200 text-xs" value={extra.unitPrice || ''} onChange={(e) => updateExtra(index, 'unitPrice', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-blue-600 uppercase">Total Item</Label>
                          <Input type="number" className="h-8 rounded-lg bg-blue-50 border-none text-xs font-black text-blue-700" value={extra.value} onChange={(e) => updateExtra(index, 'value', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Total Geral</span>
                </div>
                <span className="text-xl font-black">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Preview WhatsApp</span>
            </div>
            <div className="flex-1 bg-slate-800/50 rounded-3xl p-5 text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed border border-slate-700/50 overflow-y-auto mb-6">
              {generatedMessage}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <Button variant="ghost" className="rounded-xl h-12 font-bold text-slate-400 hover:bg-slate-800 hover:text-white gap-2" onClick={() => { navigator.clipboard.writeText(generatedMessage); showSuccess('Copiado!'); }}>
                <Copy className="w-4 h-4" /> Copiar
              </Button>
              <Button className="rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg" onClick={() => {
                const phone = tenants.find(t => t.id === selectedTenantId)?.phone?.replace(/\D/g, '');
                window.open(`https://wa.me/${phone || ''}?text=${encodeURIComponent(generatedMessage)}`, '_blank');
              }}>
                <Send className="w-4 h-4" /> Enviar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};