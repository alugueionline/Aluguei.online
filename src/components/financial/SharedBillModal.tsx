"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Users, Calculator, Save, Loader2, Info, UserPlus, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface SharedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CalculationMode = 'igual' | 'morador' | 'leitura';

export const SharedBillModal = ({ isOpen, onClose }: SharedBillModalProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'agua' | 'energia' | 'internet' | 'outros'>('energia');
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('igual');
  const [totalValue, setTotalValue] = useState('');
  const [kwhPrice, setKwhPrice] = useState('1.10');
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Record<string, { 
    selected: boolean, 
    prevReading?: string, 
    currReading?: string
  }>>({});

  useEffect(() => {
    const fetchTenants = async () => {
      const { data } = await supabase
        .from('tenants')
        .select('id, name, residents_count, property_id, properties(name)')
        .eq('status', 'ativo');
      
      if (data) {
        setTenants(data);
        const initial: any = {};
        data.forEach(t => {
          initial[t.id] = { selected: false, prevReading: '0', currReading: '0' };
        });
        setSelectedTenants(initial);
      }
    };
    if (isOpen) fetchTenants();
  }, [isOpen]);

  const handleSelectAll = (select: boolean) => {
    const updated = { ...selectedTenants };
    Object.keys(updated).forEach(id => {
      updated[id].selected = select;
    });
    setSelectedTenants(updated);
  };

  useEffect(() => {
    if (type !== 'energia' && calculationMode === 'leitura') {
      setCalculationMode('igual');
    }
  }, [type, calculationMode]);

  const summary = useMemo(() => {
    const activeTenants = tenants.filter(t => selectedTenants[t.id]?.selected);
    const totalVal = Number(totalValue) || 0;
    
    if (calculationMode === 'morador') {
      const totalResidents = activeTenants.reduce((acc, t) => acc + (t.residents_count || 1), 0);
      const valuePerResident = totalResidents > 0 ? totalVal / totalResidents : 0;
      return { totalResidents, valuePerResident };
    }
    
    return { totalResidents: 0, valuePerResident: 0 };
  }, [tenants, selectedTenants, totalValue, calculationMode]);

  const handleSave = async () => {
    const activeTenants = tenants.filter(t => selectedTenants[t.id]?.selected);
    
    if (activeTenants.length === 0) {
      showError('Selecione pelo menos um inquilino para o rateio.');
      return;
    }

    if (calculationMode !== 'leitura' && !totalValue) {
      showError('Insira o valor total da fatura.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const billsToInsert = activeTenants.map(t => {
        let finalValue = 0;
        const config = selectedTenants[t.id];

        if (calculationMode === 'leitura') {
          const consumption = (Number(config.currReading) || 0) - (Number(config.prevReading) || 0);
          finalValue = consumption * (Number(kwhPrice) || 0);
        } else if (calculationMode === 'morador') {
          finalValue = (t.residents_count || 1) * summary.valuePerResident;
        } else {
          finalValue = (Number(totalValue) || 0) / activeTenants.length;
        }

        return {
          user_id: user.id,
          tenant_id: t.id,
          property_id: t.property_id,
          type,
          total_value: finalValue,
          calculated_value: finalValue,
          month,
          year: parseInt(year),
          status: 'pendente',
          billing_method: calculationMode === 'leitura' ? 'consumo_kwh' : (calculationMode === 'morador' ? 'por_pessoa' : 'fixo'),
          residents: calculationMode === 'morador' ? t.residents_count : null,
          previous_reading: calculationMode === 'leitura' ? Number(config.prevReading) : null,
          current_reading: calculationMode === 'leitura' ? Number(config.currReading) : null,
          kwh_price: calculationMode === 'leitura' ? Number(kwhPrice) : null
        };
      });

      const { error } = await supabase.from('bills').insert(billsToInsert);
      if (error) throw error;

      showSuccess(`Rateio de ${type} lançado para ${billsToInsert.length} inquilinos!`);
      onClose();
    } catch (err: any) {
      showError('Erro ao processar rateio: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">Rateio de Despesas</DialogTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Lançamento em massa para inquilinos</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 bg-white max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipo de Conta</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energia">Energia ⚡</SelectItem>
                  <SelectItem value="agua">Água 💧</SelectItem>
                  <SelectItem value="internet">Internet 🌐</SelectItem>
                  <SelectItem value="outros">Outros 📦</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mês de Referência</Label>
              <Input 
                type="month" 
                value={`${year}-${month}`} 
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-');
                  setYear(y);
                  setMonth(m);
                }}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-blue-600 ml-1">Modo de Divisão</Label>
            <div className={cn(
              "grid gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100",
              type === 'energia' ? "grid-cols-3" : "grid-cols-2"
            )}>
              <button 
                onClick={() => setCalculationMode('igual')}
                className={cn(
                  "flex flex-col items-center justify-center py-3 rounded-xl transition-all gap-1",
                  calculationMode === 'igual' ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Igual</span>
              </button>
              <button 
                onClick={() => setCalculationMode('morador')}
                className={cn(
                  "flex flex-col items-center justify-center py-3 rounded-xl transition-all gap-1",
                  calculationMode === 'morador' ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Morador</span>
              </button>
              {type === 'energia' && (
                <button 
                  onClick={() => setCalculationMode('leitura')}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 rounded-xl transition-all gap-1",
                    calculationMode === 'leitura' ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Leitura</span>
                </button>
              )}
            </div>
          </div>

          {calculationMode !== 'leitura' ? (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valor Total da Fatura (R$)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                <Input 
                  type="number" 
                  placeholder="0,00" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-black text-xl text-blue-600"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
              </div>
              {calculationMode === 'morador' && summary.totalResidents > 0 && (
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 ml-1">
                  Total de {summary.totalResidents} moradores • R$ {summary.valuePerResident.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por pessoa
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-orange-600 ml-1">Preço do kWh (R$)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={kwhPrice}
                onChange={(e) => setKwhPrice(e.target.value)}
                className="h-12 rounded-xl bg-orange-50/50 border-none font-bold text-orange-700"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <Users className="w-3 h-3" /> Selecionar Inquilinos
              </Label>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSelectAll(true)}
                  className="h-6 px-2 text-[10px] font-black text-blue-600 hover:bg-blue-50 gap-1"
                >
                  <CheckSquare className="w-3 h-3" /> TODOS
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSelectAll(false)}
                  className="h-6 px-2 text-[10px] font-black text-slate-400 hover:bg-slate-50 gap-1"
                >
                  <Square className="w-3 h-3" /> LIMPAR
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {tenants.map(t => (
                <div key={t.id} className={cn(
                  "flex flex-col p-4 rounded-2xl border transition-all",
                  selectedTenants[t.id]?.selected ? "bg-blue-50/30 border-blue-100" : "bg-slate-50 border-slate-100 opacity-60"
                )}>
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedTenants[t.id]?.selected}
                      onCheckedChange={(checked) => setSelectedTenants({
                        ...selectedTenants,
                        [t.id]: { ...selectedTenants[t.id], selected: !!checked }
                      })}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{t.properties?.name} • {t.residents_count || 1} Moradores</p>
                    </div>
                    {calculationMode === 'morador' && selectedTenants[t.id]?.selected && (
                      <div className="text-right">
                        <p className="text-xs font-black text-blue-600">
                          R$ {((t.residents_count || 1) * summary.valuePerResident).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>

                  {calculationMode === 'leitura' && selectedTenants[t.id]?.selected && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pl-7">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black text-slate-400 uppercase">Leitura Anterior</Label>
                        <Input 
                          type="number" 
                          className="h-10 rounded-xl bg-white border-slate-200 font-bold" 
                          value={selectedTenants[t.id].prevReading}
                          onChange={(e) => setSelectedTenants({
                            ...selectedTenants,
                            [t.id]: { ...selectedTenants[t.id], prevReading: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black text-slate-400 uppercase">Leitura Atual</Label>
                        <Input 
                          type="number" 
                          className="h-10 rounded-xl bg-white border-slate-200 font-bold"
                          value={selectedTenants[t.id].currReading}
                          onChange={(e) => setSelectedTenants({
                            ...selectedTenants,
                            [t.id]: { ...selectedTenants[t.id], currReading: e.target.value }
                          })}
                        />
                      </div>
                      <div className="col-span-2 text-[10px] font-black text-blue-600 text-right">
                        Consumo: {(Number(selectedTenants[t.id].currReading) - Number(selectedTenants[t.id].prevReading)) || 0} kWh 
                        = R$ {(((Number(selectedTenants[t.id].currReading) - Number(selectedTenants[t.id].prevReading)) || 0) * Number(kwhPrice)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-white">
            <Button 
              className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              LANÇAR RATEIO NO FINANCEIRO
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};