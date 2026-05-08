"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Users, Receipt, Building2, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ApportionmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ApportionmentModal = ({ isOpen, onClose, onSave }: ApportionmentModalProps) => {
  const [type, setType] = useState('energia');
  const [totalValue, setTotalValue] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('id, name');
      setProperties(data || []);
      if (data) setSelectedParticipants(data.map(p => p.id));
    };
    if (isOpen) fetchProperties();
  }, [isOpen]);

  const individualValue = parseFloat(totalValue) / (selectedParticipants.length || 1);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Criar lançamentos individuais para cada imóvel
      const billsToInsert = selectedParticipants.map(propId => ({
        user_id: user.id,
        property_id: propId,
        type: type,
        month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
        year: new Date().getFullYear(),
        total_value: parseFloat(totalValue),
        calculated_value: individualValue,
        status: 'pendente'
      }));

      const { error } = await supabase.from('bills').insert(billsToInsert);
      if (error) throw error;

      onSave({
        type,
        totalValue: parseFloat(totalValue),
        participantsCount: selectedParticipants.length,
        individualValue,
        date: new Date().toISOString()
      });

      showSuccess('Rateio processado e enviado para as cobranças!');
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Novo Rateio de Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Conta</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
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
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total (R$)</Label>
              <div className="relative">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  type="number" 
                  step="0.01"
                  className="pl-11 h-12 rounded-xl bg-slate-50 border-none font-bold"
                  placeholder="0,00"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
              Selecionar Imóveis Participantes
              <span className="text-blue-600">{selectedParticipants.length} selecionados</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 border rounded-2xl bg-slate-50/50">
              {properties.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedParticipants.includes(p.id) 
                      ? "bg-white border-blue-200 shadow-sm" 
                      : "bg-transparent border-transparent text-slate-400"
                  )}
                >
                  <Checkbox checked={selectedParticipants.includes(p.id)} />
                  <div className="flex items-center gap-2">
                    <Building2 className={cn("w-4 h-4", selectedParticipants.includes(p.id) ? "text-blue-600" : "text-slate-300")} />
                    <span className="text-sm font-bold truncate">{p.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cálculo Individual</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                  R$ {individualValue > 0 ? individualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Divisão Igualitária</p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-bold text-slate-600">{selectedParticipants.length} Unidades</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Processar Rateio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};