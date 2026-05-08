"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Users, Receipt, Building2, Loader2, Info } from 'lucide-react';
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
      // Buscamos propriedades e seus inquilinos ativos para saber o número de moradores
      const { data } = await supabase
        .from('properties')
        .select(`
          id, 
          name,
          tenants (
            id,
            name,
            residents_count,
            status
          )
        `);
      
      // Filtramos apenas propriedades que têm inquilinos ativos (ou tratamos como 0 moradores)
      const formatted = (data || []).map(p => {
        const activeTenant = p.tenants?.find((t: any) => t.status === 'ativo');
        return {
          id: p.id,
          name: p.name,
          residents: activeTenant?.residents_count || 0
        };
      });

      setProperties(formatted);
      if (formatted.length > 0) setSelectedParticipants(formatted.map(p => p.id));
    };
    if (isOpen) fetchProperties();
  }, [isOpen]);

  // Cálculo do total de moradores selecionados
  const totalResidents = properties
    .filter(p => selectedParticipants.includes(p.id))
    .reduce((acc, p) => acc + p.residents, 0);

  const valuePerPerson = totalResidents > 0 ? parseFloat(totalValue) / totalResidents : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalResidents === 0) {
      showError('Nenhum morador encontrado nas unidades selecionadas.');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      // Criar lançamentos individuais baseados no número de moradores de cada imóvel
      const billsToInsert = properties
        .filter(p => selectedParticipants.includes(p.id) && p.residents > 0)
        .map(p => ({
          user_id: user.id,
          property_id: p.id,
          type: type,
          month: currentMonth,
          year: currentYear,
          total_value: parseFloat(totalValue), // Valor total da fatura original
          calculated_value: p.residents * valuePerPerson, // Valor que esta unidade deve pagar
          status: 'pendente'
        }));

      if (billsToInsert.length === 0) throw new Error('Nenhuma unidade com moradores para ratear.');

      const { error } = await supabase.from('bills').insert(billsToInsert);
      if (error) throw error;

      onSave({
        type,
        totalValue: parseFloat(totalValue),
        totalResidents,
        valuePerPerson,
        date: new Date().toISOString()
      });

      showSuccess(`Rateio de ${type} processado por pessoa!`);
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
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Rateio por Pessoa (Morador)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-blue-800 leading-relaxed">
              O sistema somará todos os moradores das unidades selecionadas e dividirá o valor total. Cada casa pagará proporcionalmente ao seu número de moradores.
            </p>
          </div>

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
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total da Fatura (R$)</Label>
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
              Unidades Participantes
              <span className="text-blue-600">{totalResidents} moradores no total</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 border rounded-2xl bg-slate-50/50">
              {properties.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                    selectedParticipants.includes(p.id) 
                      ? "bg-white border-blue-200 shadow-sm" 
                      : "bg-transparent border-transparent text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedParticipants.includes(p.id)} />
                    <div className="flex items-center gap-2">
                      <Building2 className={cn("w-4 h-4", selectedParticipants.includes(p.id) ? "text-blue-600" : "text-slate-300")} />
                      <span className="text-sm font-bold truncate max-w-[120px]">{p.name}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black border-slate-100">
                    {p.residents} {p.residents === 1 ? 'PESSOA' : 'PESSOAS'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Valor por Pessoa</p>
                <p className="text-2xl font-black leading-none mt-1">
                  R$ {valuePerPerson > 0 ? valuePerPerson.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Cálculo</p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-sm font-bold">{totalResidents} Moradores</span>
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