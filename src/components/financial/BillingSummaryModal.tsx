"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Copy, Send, Calculator, Landmark, User, Trash2, Plus, Search } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface BillingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

// Mock de dados para seleção rápida
const availableTenants = [
  { id: '1', name: 'João Silva', property: 'Apto 101', rent: 1200 },
  { id: '2', name: 'Maria Oliveira', property: 'Casa 02', rent: 2500 },
  { id: '3', name: 'Pedro Santos', property: 'Kitnet A', rent: 850 },
  { id: '4', name: 'Ana Costa', property: 'Apto 202', rent: 1300 },
];

export const BillingSummaryModal = ({ isOpen, onClose, initialData }: BillingSummaryModalProps) => {
  const [tenant, setTenant] = useState('');
  const [pixKey, setPixKey] = useState('seu-pix@email.com');
  const [rentValue, setRentValue] = useState('0');
  const [condoValue, setCondoValue] = useState('0');
  const [extraValues, setExtraValues] = useState([
    { label: 'Energia', value: '0' },
    { label: 'Água', value: '0' }
  ]);
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Função para carregar dados de um inquilino selecionado
  const handleSelectTenant = (id: string) => {
    const selected = availableTenants.find(t => t.id === id);
    if (selected) {
      setTenant(selected.name);
      setRentValue(selected.rent.toString());
      showSuccess(`Dados de ${selected.name} carregados!`);
    }
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setTenant(initialData.tenant || '');
      if (initialData.category === 'Aluguel') {
        setRentValue(initialData.value?.toString() || '0');
      } else {
        setExtraValues([{ label: initialData.category, value: initialData.value?.toString() || '0' }]);
        setRentValue('0');
      }
    } else if (isOpen && !initialData) {
      setTenant('');
      setRentValue('0');
      setCondoValue('0');
      setExtraValues([{ label: 'Energia', value: '0' }, { label: 'Água', value: '0' }]);
    }
  }, [isOpen, initialData]);

  const calculateTotal = () => {
    const rent = parseFloat(rentValue) || 0;
    const condo = parseFloat(condoValue) || 0;
    const extras = extraValues.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
    return rent + condo + extras;
  };

  const total = calculateTotal();

  useEffect(() => {
    const tenantName = tenant || 'Inquilino';
    const rent = parseFloat(rentValue) || 0;
    const condo = parseFloat(condoValue) || 0;
    
    let details = '';
    if (rent > 0) details += `• Aluguel: R$ ${rent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (condo > 0) details += `• Condomínio: R$ ${condo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    extraValues.forEach(e => {
      const val = parseFloat(e.value) || 0;
      if (val > 0 && e.label) {
        details += `• ${e.label}: R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      }
    });

    const message = `Olá ${tenantName}! 👋\n\nEstou enviando o resumo do aluguel e demais valores deste mês:\n\n${details}\n💰 *Total a pagar: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n🔑 *Chave PIX:* ${pixKey}\n\nQualquer dúvida, estou à disposição!`;
    
    setGeneratedMessage(message);
  }, [tenant, rentValue, condoValue, extraValues, pixKey, total]);

  const handleSendWhatsApp = () => {
    const encodedMessage = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
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
      <DialogContent className="sm:max-w-[750px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 h-[650px]">
          {/* Configurações */}
          <div className="p-8 space-y-6 bg-white overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Resumo de Cobrança</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-5">
              {/* Seletor de Inquilino */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Selecionar Inquilino Ativo</Label>
                <Select onValueChange={handleSelectTenant}>
                  <SelectTrigger className="h-12 rounded-xl bg-blue-50/50 border-blue-100 font-bold text-blue-900">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <SelectValue placeholder="Escolha um inquilino..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.property})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome na Mensagem</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    placeholder="Nome do inquilino" 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-none font-bold"
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                  />
                </div>
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
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outros Custos</Label>
                  <Button variant="ghost" size="sm" onClick={addExtra} className="h-6 px-2 text-blue-600 font-bold text-[10px]">
                    <Plus className="w-3 h-3 mr-1" /> ADICIONAR
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {extraValues.map((extra, index) => (
                    <div key={index} className="flex gap-2 group">
                      <Input 
                        placeholder="Ex: Luz" 
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
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave PIX</Label>
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
                  <span className="text-xs font-black uppercase tracking-widest">Total Real</span>
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
            
            <div className="flex-1 bg-slate-800/50 rounded-3xl p-6 text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed border border-slate-700/50 overflow-y-auto">
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
                <Send className="w-4 h-4" /> Enviar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};