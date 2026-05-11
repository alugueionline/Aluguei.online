"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Copy, Send, Calculator, Landmark, Trash2, Plus, Search, Loader2, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [extraValues, setExtraValues] = useState<any[]>([]);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('tenants')
        .select('id, name, phone, property_id, properties(name, condo_fee)')
        .eq('status', 'ativo');
      setTenants(data || []);
      setLoading(false);
      
      if (tenantId) {
        handleSelectTenant(tenantId, data || []);
      }
    };
    if (isOpen) fetchTenants();
  }, [isOpen, tenantId]);

  const handleSelectTenant = async (id: string, currentTenants?: any[]) => {
    setSelectedTenantId(id);
    const list = currentTenants || tenants;
    const tenant = list.find(t => t.id === id);
    if (!tenant) return;

    try {
      setLoading(true);
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('tenant_id', id)
        .in('status', ['pendente', 'atrasado']);

      const { data: contracts } = await supabase
        .from('contracts')
        .select('rent_value, property_id, properties(condo_fee)')
        .eq('tenant_id', id)
        .eq('status', 'ativo');

      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      let totalRent = 0;
      const extras: any[] = [];

      bills?.forEach(b => {
        const val = Number(b.calculated_value || b.total_value || 0);
        if (b.type === 'aluguel' && b.month === currentMonth && b.year === currentYear) {
          totalRent += val;
        } else {
          extras.push({
            label: `${b.type.charAt(0).toUpperCase() + b.type.slice(1)} (${b.month}/${b.year})`,
            value: val.toString()
          });
        }
      });

      contracts?.forEach(c => {
        const hasRentBillThisMonth = bills?.some(b => 
          b.type === 'aluguel' && 
          b.property_id === c.property_id && 
          b.month === currentMonth && 
          b.year === currentYear
        );

        if (!hasRentBillThisMonth) {
          totalRent += Number(c.rent_value || 0);
        }
      });

      setRentValue(totalRent.toString());
      setFineValue('0');
      setInterestValue('0');
      setExtraValues(extras);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      showError('Erro ao carregar débitos do inquilino.');
    } finally {
      setLoading(false);
    }
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
    const tenantName = tenantObj?.name || 'Inquilino';
    const rent = parseFloat(rentValue) || 0;
    const fine = parseFloat(fineValue) || 0;
    const interest = parseFloat(interestValue) || 0;
    
    let details = '';
    if (rent > 0) details += `• *Aluguel:* R$ ${rent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (fine > 0) details += `• *Multa:* R$ ${fine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (interest > 0) details += `• *Juros:* R$ ${interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    extraValues.forEach(e => {
      const val = parseFloat(e.value) || 0;
      if (val > 0 && e.label) {
        details += `• *${e.label}:* R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      }
    });

    return `Olá ${tenantName}! 👋\n\nEstou enviando o resumo do aluguel e demais valores pendentes:\n\n${details}\n💰 *Total a pagar: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n🔑 *Chave PIX:* ${pixKey}\n\nQualquer dúvida, estou à disposição!`;
  }, [selectedTenantId, rentValue, fineValue, interestValue, extraValues, pixKey, total, tenants]);

  const handleSendWhatsApp = () => {
    const tenantObj = tenants.find(t => t.id === selectedTenantId);
    const phone = tenantObj?.phone?.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/${phone ? phone : ''}?text=${encodedMessage}`, '_blank');
    showSuccess('Redirecionando para o WhatsApp...');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    showSuccess('Mensagem copiada!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 h-[700px]">
          <div className="p-8 space-y-6 bg-white overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Detalhamento de Débitos</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Inquilino Selecionado</Label>
                <Select onValueChange={(v) => handleSelectTenant(v)} value={selectedTenantId}>
                  <SelectTrigger className="h-12 rounded-xl bg-blue-50/50 border-blue-100 font-bold text-blue-900">
                    <div className="flex items-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <SelectValue placeholder="Escolha um inquilino..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.properties?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel Base (R$)</Label>
                <Input 
                  type="number" 
                  className="h-11 rounded-xl bg-slate-50 border-none font-bold"
                  value={rentValue}
                  onChange={(e) => setRentValue(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Multa (R$)
                  </Label>
                  <Input 
                    type="number" 
                    className="h-11 rounded-xl bg-rose-50/50 border-none font-bold text-rose-700"
                    value={fineValue}
                    onChange={(e) => setFineValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Juros (R$)
                  </Label>
                  <Input 
                    type="number" 
                    className="h-11 rounded-xl bg-rose-50/50 border-none font-bold text-rose-700"
                    value={interestValue}
                    onChange={(e) => setInterestValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contas Pendentes / Atrasadas</Label>
                  <Button variant="ghost" size="sm" onClick={() => setExtraValues([...extraValues, { label: '', value: '0' }])} className="h-6 px-2 text-blue-600 font-bold text-[10px]">
                    <Plus className="w-3 h-3 mr-1" /> ADICIONAR
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {extraValues.map((extra, index) => (
                    <div key={index} className="flex gap-2 group">
                      <Input 
                        placeholder="Ex: Água" 
                        className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold flex-1"
                        value={extra.label}
                        onChange={(e) => {
                          const newExtras = [...extraValues];
                          newExtras[index].label = e.target.value;
                          setExtraValues(newExtras);
                        }}
                      />
                      <Input 
                        type="number" 
                        className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold w-24"
                        value={extra.value}
                        onChange={(e) => {
                          const newExtras = [...extraValues];
                          newExtras[index].value = e.target.value;
                          setExtraValues(newExtras);
                        }}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setExtraValues(extraValues.filter((_, i) => i !== index))}
                        className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave PIX</Label>
                <div className="relative">
                  < Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-none font-bold text-xs"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 sticky bottom-0 bg-white">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-600">
                  <Calculator className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Total Consolidado</span>
                </div>
                <span className="text-xl font-black text-blue-900">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-blue-400">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Mensagem de Cobrança</span>
            </div>
            
            <div className="flex-1 bg-slate-800/50 rounded-3xl p-6 text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed border border-slate-700/50 overflow-y-auto font-sans">
              {generatedMessage}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button 
                variant="ghost" 
                className="rounded-xl h-12 font-bold text-slate-400 hover:bg-slate-800 hover:text-white gap-2"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" /> Copiar
              </Button>
              <Button 
                className="rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg shadow-emerald-900/20"
                onClick={handleSendWhatsApp}
              >
                <Send className="w-4 h-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};