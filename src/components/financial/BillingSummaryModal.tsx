"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Copy, Send, Calculator, Landmark, User } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface BillingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingSummaryModal = ({ isOpen, onClose }: BillingSummaryModalProps) => {
  const [tenant, setTenant] = useState('');
  const [pixKey, setPixKey] = useState('seu-pix@email.com');
  const [rentValue, setRentValue] = useState('1200');
  const [extraValues, setExtraValues] = useState([
    { label: 'Energia', value: '145.20' },
    { label: 'Água', value: '80.00' }
  ]);
  const [generatedMessage, setGeneratedMessage] = useState('');

  const total = parseFloat(rentValue) + extraValues.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);

  useEffect(() => {
    const tenantName = tenant || 'Inquilino';
    const extrasText = extraValues
      .filter(e => e.value && parseFloat(e.value) > 0)
      .map(e => `• ${e.label}: R$ ${parseFloat(e.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .join('\n');

    const message = `Olá ${tenantName}! 👋\n\nEstou enviando o resumo do aluguel e demais valores deste mês:\n\n• Aluguel: R$ ${parseFloat(rentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n${extrasText}\n\n💰 *Total a pagar: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n🔑 *Chave PIX:* ${pixKey}\n\nQualquer dúvida, estou à disposição!`;
    
    setGeneratedMessage(message);
  }, [tenant, rentValue, extraValues, pixKey, total]);

  const handleSendWhatsApp = () => {
    const encodedMessage = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    showSuccess('Redirecionando para o WhatsApp...');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    showSuccess('Mensagem copiada para a área de transferência!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Configurações */}
          <div className="p-8 space-y-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Resumo de Cobrança</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilino</Label>
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

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valores Adicionais</Label>
                {extraValues.map((extra, index) => (
                  <div key={index} className="flex gap-2">
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
                      placeholder="0,00" 
                      className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold w-24"
                      value={extra.value}
                      onChange={(e) => {
                        const newExtras = [...extraValues];
                        newExtras[index].value = e.target.value;
                        setExtraValues(newExtras);
                      }}
                    />
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50"
                  onClick={() => setExtraValues([...extraValues, { label: '', value: '' }])}
                >
                  + Adicionar Item
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-600">
                  <Calculator className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Total Geral</span>
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
            
            <div className="flex-1 bg-slate-800/50 rounded-3xl p-6 text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed border border-slate-700/50">
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