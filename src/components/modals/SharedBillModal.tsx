"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess, showError } from '@/utils/toast';
import { Calculator, Users, Loader2, Zap, Droplets, Wifi, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface SharedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharedBillModal = ({ isOpen, onClose }: SharedBillModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  const [type, setType] = useState('energia');
  const [totalValue, setTotalValue] = useState('');
  const [date, setDate] = useState(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);

  useEffect(() => {
    const fetchTenants = async () => {
      const { data } = await supabase
        .from('tenants')
        .select('id, name, property_id, properties(name)')
        .eq('status', 'ativo');
      setTenants(data || []);
    };
    if (isOpen) {
      fetchTenants();
      setSelectedTenants([]);
      setTotalValue('');
    }
  }, [isOpen]);

  const valuePerPerson = useMemo(() => {
    const total = parseFloat(totalValue) || 0;
    const count = selectedTenants.length;
    return count > 0 ? total / count : 0;
  }, [totalValue, selectedTenants]);

  const handleToggleTenant = (id: string) => {
    setSelectedTenants(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenants.length === 0) {
      showError('Selecione pelo menos um inquilino.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const [year, month] = date.split('-');
      
      // Criar uma conta para cada inquilino selecionado
      const billsToInsert = selectedTenants.map(tenantId => {
        const tenant = tenants.find(t => t.id === tenantId);
        return {
          user_id: user.id,
          tenant_id: tenantId,
          property_id: tenant.property_id,
          type,
          month,
          year: parseInt(year),
          total_value: valuePerPerson,
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
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Dividir Conta</DialogTitle>
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
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
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
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total da Nota (R$)</Label>
            <Input 
              type="number" 
              step="0.01"
              placeholder="0,00"
              value={totalValue}
              onChange={(e) => setTotalValue(e.target.value)}
              className="h-14 rounded-2xl bg-blue-50/30 border-2 border-blue-100 font-black text-xl text-blue-900"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Inquilinos Participantes</Label>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {tenants.map((t) => (
                <div 
                  key={t.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                    selectedTenants.includes(t.id) ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:bg-slate-50"
                  )}
                  onClick={() => handleToggleTenant(t.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedTenants.includes(t.id)} onCheckedChange={() => handleToggleTenant(t.id)} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{t.properties?.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor por Pessoa</p>
                <p className="text-xs text-slate-300 font-medium">{selectedTenants.length} participantes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-400">
                R$ {valuePerPerson.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button 
              type="submit" 
              disabled={loading || !totalValue || selectedTenants.length === 0}
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