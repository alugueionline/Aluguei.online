"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { Calculator, Users, Loader2, UserCheck, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface SharedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CalculationMode = 'divide' | 'fixed_per_person';

export const SharedBillModal = ({ isOpen, onClose }: SharedBillModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  const [type, setType] = useState('agua');
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('fixed_per_person');
  const [totalValue, setTotalValue] = useState('');
  const [fixedValuePerPerson, setFixedValuePerPerson] = useState('50');
  const [date, setDate] = useState(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);

  useEffect(() => {
    const fetchTenants = async () => {
      const { data } = await supabase
        .from('tenants')
        .select('id, name, residents_count, property_id, properties(name)')
        .eq('status', 'ativo');
      setTenants(data || []);
    };
    
    if (isOpen) {
      fetchTenants();
      setSelectedTenants([]);
      setTotalValue('');
      // Se for água, sugerimos o modo por pessoa por padrão
      if (type === 'agua') setCalculationMode('fixed_per_person');
    }
  }, [isOpen, type]);

  const handleToggleTenant = useCallback((id: string) => {
    setSelectedTenants(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }, []);

  const calculateTenantValue = (tenant: any) => {
    if (calculationMode === 'divide') {
      const total = parseFloat(totalValue) || 0;
      const count = selectedTenants.length;
      return count > 0 ? total / count : 0;
    } else {
      const fixed = parseFloat(fixedValuePerPerson) || 0;
      const residents = tenant.residents_count || 1;
      return fixed * residents;
    }
  };

  const totalSum = useMemo(() => {
    return selectedTenants.reduce((acc, tenantId) => {
      const tenant = tenants.find(t => t.id === tenantId);
      return acc + (tenant ? calculateTenantValue(tenant) : 0);
    }, 0);
  }, [selectedTenants, calculationMode, totalValue, fixedValuePerPerson, tenants]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenants.length === 0) {
      showError('Selecione pelo menos um inquilino.');
      return;
    }

    if (calculationMode === 'divide' && !totalValue) {
      showError('Informe o valor total da conta.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const [year, month] = date.split('-');
      
      const billsToInsert = selectedTenants.map(tenantId => {
        const tenant = tenants.find(t => t.id === tenantId);
        const finalValue = calculateTenantValue(tenant);
        
        return {
          user_id: user.id,
          tenant_id: tenantId,
          property_id: tenant.property_id,
          type,
          month,
          year: parseInt(year),
          total_value: finalValue,
          status: 'pendente'
        };
      });

      const { error } = await supabase.from('bills').insert(billsToInsert);
      if (error) throw error;

      showSuccess(`Sucesso! ${selectedTenants.length} cobranças geradas.`);
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
    } catch (err: any) {
      showError('Erro ao processar divisão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Lançamento de Despesas</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Despesa</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="extra">Taxa Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês de Referência</Label>
              <Input 
                type="month" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Modo de Cálculo</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCalculationMode('fixed_per_person')}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all font-bold text-sm",
                  calculationMode === 'fixed_per_person' 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                )}
              >
                <Users className="w-4 h-4" /> Valor Fixo por Pessoa
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode('divide')}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all font-bold text-sm",
                  calculationMode === 'divide' 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                )}
              >
                <Calculator className="w-4 h-4" /> Dividir Valor Total
              </button>
            </div>
          </div>

          {calculationMode === 'divide' ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total da Fatura (R$)</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0,00"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="h-14 rounded-2xl bg-slate-50 border-none font-black text-xl text-slate-900"
              />
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor por Pessoa (R$)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={fixedValuePerPerson}
                onChange={(e) => setFixedValuePerPerson(e.target.value)}
                className="h-14 rounded-2xl bg-blue-50/30 border-2 border-blue-100 font-black text-xl text-blue-900"
              />
              <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                <Info className="w-3 h-3" /> O sistema multiplicará este valor pelo número de moradores de cada inquilino.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Inquilinos</Label>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {tenants.map((t) => {
                const val = calculateTenantValue(t);
                const isSelected = selectedTenants.includes(t.id);
                
                return (
                  <label 
                    key={t.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none",
                      isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isSelected} 
                        onCheckedChange={() => handleToggleTenant(t.id)} 
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.properties?.name}</span>
                          <Badge variant="outline" className="text-[8px] font-black border-blue-100 text-blue-600 bg-white">
                            {t.residents_count || 1} {t.residents_count === 1 ? 'MORADOR' : 'MORADORES'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-right">
                        <p className="text-xs font-black text-blue-600">
                          R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Resumo da Operação</p>
                <p className="text-xs text-slate-300 font-medium">{selectedTenants.length} inquilinos selecionados</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total a Lançar</p>
              <p className="text-2xl font-black text-blue-400">
                R$ {totalSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button 
              type="submit" 
              disabled={loading || selectedTenants.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 font-black h-14 shadow-lg shadow-blue-100 gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
              Gerar Cobranças Individuais
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};