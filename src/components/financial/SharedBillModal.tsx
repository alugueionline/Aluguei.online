"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Users, Calculator, Save, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface SharedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharedBillModal = ({ isOpen, onClose }: SharedBillModalProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'agua' | 'energia' | 'internet' | 'outros'>('energia');
  const [calculationMode, setCalculationMode] = useState<'divisao' | 'leitura'>('divisao');
  const [totalValue, setTotalValue] = useState('');
  const [kwhPrice, setKwhPrice] = useState('1.10'); // Valor médio sugerido
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Record<string, { 
    selected: boolean, 
    prevReading?: string, 
    currReading?: string,
    customValue?: string 
  }>>({});

  useEffect(() => {
    const fetchTenants = async () => {
      const { data } = await supabase
        .from('tenants')
        .select('id, name, property_id, properties(name)')
        .eq('status', 'ativo');
      
      if (data) {
        setTenants(data);
        const initial: any = {};
        data.forEach(t => {
          initial[t.id] = { selected: true, prevReading: '0', currReading: '0', customValue: '0' };
        });
        setSelectedTenants(initial);
      }
    };
    if (isOpen) fetchTenants();
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const billsToInsert = tenants
        .filter(t => selectedTenants[t.id]?.selected)
        .map(t => {
          let finalValue = 0;
          const config = selectedTenants[t.id];

          if (calculationMode === 'leitura' && type === 'energia') {
            const consumption = (Number(config.currReading) || 0) - (Number(config.prevReading) || 0);
            finalValue = consumption * (Number(kwhPrice) || 0);
          } else {
            const activeCount = Object.values(selectedTenants).filter(v => v.selected).length;
            finalValue = (Number(totalValue) || 0) / activeCount;
          }

          return {
            tenant_id: t.id,
            property_id: t.property_id,
            type,
            total_value: finalValue,
            calculated_value: finalValue,
            month,
            year: parseInt(year),
            status: 'pendente',
            description: calculationMode === 'leitura' 
              ? `Consumo de Energia: ${(Number(config.currReading) || 0) - (Number(config.prevReading) || 0)} kWh`
              : `Rateio de ${type}`
          };
        });

      const { error } = await supabase.from('bills').insert(billsToInsert);
      if (error) throw error;

      showSuccess('Contas divididas e lançadas com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      showError('Erro ao processar rateio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Dividir Contas / Rateio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Tipo de Conta</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="rounded-xl font-bold">
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
              <Label className="text-[10px] font-black uppercase text-slate-400">Mês de Referência</Label>
              <div className="flex gap-2">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i} value={(i + 1).toString().padStart(2, '0')}>
                        {new Date(2024, i).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {type === 'energia' && (
            <div className="p-4 bg-blue-50 rounded-2xl space-y-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-blue-900 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Modo de Cálculo
                </Label>
                <div className="flex bg-white p-1 rounded-lg border border-blue-200">
                  <Button 
                    variant={calculationMode === 'divisao' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 rounded-md text-[10px] font-black"
                    onClick={() => setCalculationMode('divisao')}
                  >DIVIDIR IGUAL</Button>
                  <Button 
                    variant={calculationMode === 'leitura' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 rounded-md text-[10px] font-black"
                    onClick={() => setCalculationMode('leitura')}
                  >POR LEITURA (kWh)</Button>
                </div>
              </div>

              {calculationMode === 'leitura' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-blue-600">Valor do kWh (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={kwhPrice}
                    onChange={(e) => setKwhPrice(e.target.value)}
                    className="bg-white border-blue-200 font-bold"
                  />
                </div>
              )}
            </div>
          )}

          {calculationMode === 'divisao' && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Valor Total da Fatura (R$)</Label>
              <Input 
                type="number" 
                placeholder="0,00" 
                className="h-12 rounded-xl font-bold text-lg"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
              <Users className="w-3 h-3" /> Selecionar Inquilinos e Leituras
            </Label>
            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2">
              {tenants.map(t => (
                <div key={t.id} className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedTenants[t.id]?.selected}
                      onCheckedChange={(checked) => setSelectedTenants({
                        ...selectedTenants,
                        [t.id]: { ...selectedTenants[t.id], selected: !!checked }
                      })}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{t.properties?.name}</p>
                    </div>
                  </div>

                  {calculationMode === 'leitura' && selectedTenants[t.id]?.selected && (
                    <div className="grid grid-cols-2 gap-2 pl-7">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black text-slate-400 uppercase">Leitura Anterior</Label>
                        <Input 
                          type="number" 
                          className="h-8 text-xs font-bold" 
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
                          className="h-8 text-xs font-bold"
                          value={selectedTenants[t.id].currReading}
                          onChange={(e) => setSelectedTenants({
                            ...selectedTenants,
                            [t.id]: { ...selectedTenants[t.id], currReading: e.target.value }
                          })}
                        />
                      </div>
                      <div className="col-span-2 text-[10px] font-bold text-blue-600 text-right">
                        Consumo: {(Number(selectedTenants[t.id].currReading) - Number(selectedTenants[t.id].prevReading)) || 0} kWh 
                        = R$ {(((Number(selectedTenants[t.id].currReading) - Number(selectedTenants[t.id].prevReading)) || 0) * Number(kwhPrice)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black gap-2 shadow-xl shadow-blue-100"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            LANÇAR CONTAS NO FINANCEIRO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};