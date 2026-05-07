"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Users, Receipt, Building2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface ApportionmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ApportionmentModal = ({ isOpen, onClose, onSave }: ApportionmentModalProps) => {
  const [type, setType] = useState('energia');
  const [totalValue, setTotalValue] = useState('');
  const [participants, setParticipants] = useState(['1', '2', '3', '4']); // Mock IDs
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(['1', '2', '3', '4']);

  const individualValue = parseFloat(totalValue) / (selectedParticipants.length || 1);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      totalValue: parseFloat(totalValue),
      participantsCount: selectedParticipants.length,
      individualValue,
      date: new Date().toISOString()
    });
    showSuccess('Rateio processado e enviado para as cobranças!');
    onClose();
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Novo Rateio de Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Tipo de Conta</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energia">Energia (Comum)</SelectItem>
                  <SelectItem value="agua">Água (Comum)</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="manutencao">Manutenção Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Valor Total da Fatura (R$)</Label>
              <div className="relative">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="number" 
                  step="0.01"
                  className="pl-11 h-12 rounded-xl bg-gray-50/50 border-gray-100 font-bold"
                  placeholder="0,00"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-700 flex justify-between">
              Selecionar Imóveis Participantes
              <span className="text-xs text-[#2563FF] font-black">{selectedParticipants.length} selecionados</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-2 border rounded-2xl bg-gray-50/30">
              {['Apto 101', 'Casa 02', 'Kitnet A', 'Apto 202'].map((name, i) => {
                const id = (i + 1).toString();
                return (
                  <div 
                    key={id}
                    onClick={() => toggleParticipant(id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      selectedParticipants.includes(id) 
                        ? "bg-white border-blue-200 shadow-sm" 
                        : "bg-transparent border-transparent text-gray-400"
                    )}
                  >
                    <Checkbox checked={selectedParticipants.includes(id)} />
                    <div className="flex items-center gap-2">
                      <Building2 className={cn("w-4 h-4", selectedParticipants.includes(id) ? "text-blue-600" : "text-gray-300")} />
                      <span className="text-sm font-bold">{name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-[#2563FF]/5 rounded-3xl border border-[#2563FF]/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Calculator className="w-6 h-6 text-[#2563FF]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2563FF] uppercase tracking-wider">Cálculo Individual</p>
                <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                  R$ {individualValue > 0 ? individualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Divisão Igualitária</p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-bold text-gray-600">{selectedParticipants.length} Unidades</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12 shadow-lg shadow-blue-100">
              Processar Rateio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { cn } from '@/lib/utils';