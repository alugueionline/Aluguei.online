"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Copy, Send, Calculator, Landmark, User, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface BillingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const BillingSummaryModal = ({ isOpen, onClose, initialData }: BillingSummaryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [pixKey, setPixKey] = useState('seu-pix@email.com');
  const [rentValue, setRentValue] = useState('0');
  const [condoValue, setCondoValue] = useState('0');
  const [extraValues, setExtraValues] = useState<any[]>([]);
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Carregar inquilinos reais
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('tenants')
        .select('id, name, property_id, properties(name, condo_fee)')
        .eq('status', 'ativo');
      setTenants(data || []);
      setLoading(false);
    };
    if (isOpen) fetchTenants();
  }, [isOpen]);

  // Função para carregar dados financeiros do inquilino selecionado
  const handleSelectTenant = async (id: string) => {
    setSelectedTenantId(id);
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    try {
      // 1. Buscar Aluguel do Contrato Ativo
      const { data: contract } = await supabase
        .from('contracts')
        .select('rent_value')
        .eq('tenant_id', id)
        .eq('status', 'ativo')
        .maybeSingle();

      setRentValue(contract?.rent_value?.toString() || '0');
      setCondoValue(tenant.properties?.condo_fee?.toString() || '0');

      // 2. Buscar Rateios/Contas Pendentes do Mês Atual para este imóvel
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      const { data: bills } = await supabase
        .from('bills')
        .select('type, calculated_value, total_value')
        .eq('property_id', tenant.property_id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .eq('status', 'pendente')
        .neq('type', 'aluguel'); // Não duplicar o aluguel que já vem do contrato

      if (bills && bills.length > 0) {
        const extras = bills.map(b => ({
          label: b.type.charAt(0).toUpperCase() + b.type.slice(1),
          value: (b.calculated_value || b.total_value).toString()
        }));
        setExtraValues(extras);
      } else {
        setExtraValues([]);
      }

      showSuccess(`Dados de ${tenant.name} carregados!`);
    } catch (err) {
      showError('Erro ao carregar dados financeiros.');
    }
  };

  const calculateTotal = () => {
    const rent = parseFloat(rentValue) || 0;
    const condo = parseFloat(condoValue) || 0;
    const extras = extraValues.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
    return rent + condo + extras;
  };

  const total = calculateTotal();

  useEffect(() => {
    const tenantObj = tenants.find(t => t.id === selectedTenantId);
    const tenantName = tenantObj?.name || 'Inquilino';
    const rent = parseFloat(rentValue) || 0;
    const condo = parseFloat(condoValue) || 0;
    
    let details = '';
    if (rent > 0) details += `• *Aluguel:* R$ ${rent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (condo > 0) details += `• *Condomínio:* R$ ${condo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    extraValues.forEach(e => {
      const val = parseFloat(e.value) || 0;
      if (val > 0 && e.label) {
        details += `• *${e.label}:* R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      }
    });

    const message = `Olá ${tenantName}! 👋\n\nEstou enviando o resumo do aluguel e demais valores deste mês:\n\n${details}\n💰 *Total a pagar: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n🔑 *Chave PIX:* ${pixKey}\n\nQualquer dúvida, estou à disposição!`;
    
    setGeneratedMessage(message);
  }, [selectedTenantId, rentValue, condoValue, extraValues, pixKey, total, tenants]);

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

  const addExtra = () => setExtraValues([...extraValues, { label: '', value: '0' }]);
  const removeExtra = (index: number) => setExtraValues(extraValues.filter((_, i) => i !== index));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 h-[700px]">
          {/* Configurações */}
          <div className="p-8 space-y-6 bg-white overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Resumo de Cobrança</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Selecionar Inquilino</Label>
                <Select onValueChange={handleSelectTenant} value={selectedTenantId}>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluguel (R$)</Label>
                  <Input 
                    type="number" 
                    className="h-11 rounded-xl bg-slate-50 border-none font-bold"
                    value={rentValue}
                    onChange={(e) => setRentValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condomínio (R$)</Label>
                  <Input 
                    type="number" 
                    className="h-11 rounded-xl bg-slate-50 border-none font-bold"
                    value={condoValue}
                    onChange={(e) => setCondoValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outros Custos / Rateios</Label>
                  <Button variant="ghost" size="sm" onClick={addExtra} className="h-6 px-2 text-blue-600 font-bold text-[10px]">
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
                        onClick={() => removeExtra(index)}
                        className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave PIX para Recebimento</Label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
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

          {/* Preview da Mensagem */}
          <div className="bg-slate-900 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-blue-400">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Preview WhatsApp</span>
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
                <Copy className="w-4 h-4" /> Copiar Texto
              </Button>
              <Button 
                className="rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg shadow-emerald-900/20"
                onClick={handleSendWhatsApp}
              >
                <Send className="w-4 h-4" /> Enviar WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};