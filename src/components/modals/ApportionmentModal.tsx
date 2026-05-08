"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Users, Receipt, Building2, Loader2, Info, User } from 'lucide-react';
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
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchActiveTenants = async () => {
      try {
        setFetching(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Buscamos diretamente os inquilinos ativos e seus respectivos imóveis
        const { data, error } = await supabase
          .from('tenants')
          .select(`
            id,
            name,
            residents_count,
            property_id,
            properties (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'ativo');
        
        if (error) throw error;

        const formatted = (data || []).map(t => ({
          id: t.id,
          tenantName: t.name,
          propertyName: t.properties?.name || 'Imóvel não vinculado',
          propertyId: t.property_id,
          residents: t.residents_count || 1,
        }));

        setParticipants(formatted);
        // Seleciona todos por padrão
        setSelectedParticipants(formatted.map(p => p.id));
      } catch (err: any) {
        console.error('Erro ao carregar inquilinos para rateio:', err.message);
      } finally {
        setFetching(false);
      }
    };

    if (isOpen) {
      fetchActiveTenants();
    }
  }, [isOpen]);

  const totalResidents = participants
    .filter(p => selectedParticipants.includes(p.id))
    .reduce((acc, p) => acc + p.residents, 0);

  const valuePerPerson = totalResidents > 0 ? parseFloat(totalValue) / totalResidents : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalResidents === 0) {
      showError('Nenhum morador selecionado para o rateio.');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();

      // Criamos um lançamento de conta para cada imóvel dos inquilinos selecionados
      const billsToInsert = participants
        .filter(p => selectedParticipants.includes(p.id) && p.propertyId)
        .map(p => ({
          user_id: user.id,
          property_id: p.propertyId,
          tenant_id: p.id,
          type: type,
          month: currentMonth,
          year: currentYear,
          total_value: parseFloat(totalValue),
          calculated_value: p.residents * valuePerPerson,
          status: 'pendente'
        }));

      if (billsToInsert.length === 0) throw new Error('Nenhum inquilino com imóvel vinculado selecionado.');

      const { error } = await supabase.from('bills').insert(billsToInsert);
      if (error) throw error;

      onSave({
        type,
        totalValue: parseFloat(totalValue),
        totalResidents,
        valuePerPerson,
        date: new Date().toISOString()
      });

      showSuccess(`Rateio de ${type} processado com sucesso!`);
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
              O sistema dividirá o valor total pelo número de moradores dos inquilinos selecionados.
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
              Inquilinos Participantes
              <span className="text-blue-600">{totalResidents} moradores no total</span>
            </Label>
            <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto p-4 border rounded-2xl bg-slate-50/50">
              {fetching ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : participants.length > 0 ? (
                participants.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => toggleParticipant(p.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                      selectedParticipants.includes(p.id) 
                        ? "bg-white border-blue-200 shadow-sm" 
                        : "bg-transparent border-transparent text-slate-400"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox checked={selectedParticipants.includes(p.id)} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className={cn("w-4 h-4", selectedParticipants.includes(p.id) ? "text-blue-600" : "text-slate-300")} />
                          <span className="text-sm font-black">{p.tenantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{p.propertyName}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black border-slate-100 bg-slate-50">
                      {p.residents} {p.residents === 1 ? 'MORADOR' : 'MORADORES'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 text-sm font-medium">
                  Nenhum inquilino ativo encontrado. Certifique-se de que seus inquilinos estão com status "Ativo".
                </div>
              )}
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
            <Button type="submit" disabled={loading || fetching} className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Processar Rateio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};