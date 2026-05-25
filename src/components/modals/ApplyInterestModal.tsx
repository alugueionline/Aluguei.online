"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Percent, Calendar, AlertCircle, CheckCircle2, Loader2, Info, Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface ApplyInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: () => void;
}

export const ApplyInterestModal = ({ isOpen, onClose, tenantId, onSuccess }: ApplyInterestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const [activeContract, setActiveContract] = useState<any>(null);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

  // Configurações de cálculo (padrão do sistema)
  const [config, setConfig] = useState({
    finePercent: 10,
    interestMonthly: 2,
    gracePeriod: 5
  });

  // Carregar faturas pendentes e contrato ativo do inquilino
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !tenantId) return;
      setLoading(true);
      try {
        const [billsRes, contractRes] = await Promise.all([
          supabase
            .from('bills')
            .select('*, properties(name)')
            .eq('tenant_id', tenantId)
            .neq('status', 'pago'),
          supabase
            .from('contracts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'ativo')
            .maybeSingle()
        ]);

        if (billsRes.error) throw billsRes.error;
        if (contractRes.error) throw contractRes.error;

        setBills(billsRes.data || []);
        setActiveContract(contractRes.data);
        
        // Selecionar todas por padrão
        if (billsRes.data) {
          setSelectedBillIds(billsRes.data.map((b: any) => b.id));
        }
      } catch (err: any) {
        showError('Erro ao carregar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, tenantId]);

  // Calcular multas e juros para cada fatura
  const calculatedBills = useMemo(() => {
    const dueDay = activeContract?.due_day || 5;
    const now = new Date();

    return bills.map(bill => {
      // Valor base = total_value - fine_value - interest_value (para evitar juros sobre juros)
      const baseValue = Number(bill.total_value) - (Number(bill.fine_value) || 0) - (Number(bill.interest_value) || 0);
      
      // Data de vencimento estimada
      const dueDate = new Date(bill.year, parseInt(bill.month) - 1, dueDay);
      
      // Dias de atraso
      const diffTime = now.getTime() - dueDate.getTime();
      const daysLate = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      let fine = 0;
      let interest = 0;

      if (daysLate > config.gracePeriod) {
        fine = baseValue * (config.finePercent / 100);
        // Juros pro-rata die (diário) baseado na taxa mensal
        const dailyInterestRate = (config.interestMonthly / 30) / 100;
        interest = baseValue * dailyInterestRate * daysLate;
      }

      const totalUpdated = baseValue + fine + interest;

      return {
        ...bill,
        baseValue,
        dueDate,
        daysLate,
        calculatedFine: fine,
        calculatedInterest: interest,
        totalUpdated
      };
    });
  }, [bills, activeContract, config]);

  const handleApply = async () => {
    if (selectedBillIds.length === 0) {
      showError('Selecione pelo menos uma fatura para aplicar.');
      return;
    }

    setUpdating(true);
    try {
      const billsToUpdate = calculatedBills.filter(b => selectedBillIds.includes(b.id));

      const promises = billsToUpdate.map(b => {
        return supabase
          .from('bills')
          .update({
            fine_value: b.calculatedFine,
            interest_value: b.calculatedInterest,
            total_value: b.totalUpdated,
            status: b.daysLate > 0 ? 'atrasado' : b.status
          })
          .eq('id', b.id);
      });

      const results = await Promise.all(promises);
      const error = results.find(r => r.error);
      if (error) throw error.error;

      showSuccess('Multas e juros aplicados com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      showError('Erro ao aplicar multas/juros: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const totalOriginal = calculatedBills
    .filter(b => selectedBillIds.includes(b.id))
    .reduce((acc, curr) => acc + curr.baseValue, 0);

  const totalFines = calculatedBills
    .filter(b => selectedBillIds.includes(b.id))
    .reduce((acc, curr) => acc + curr.calculatedFine, 0);

  const totalInterest = calculatedBills
    .filter(b => selectedBillIds.includes(b.id))
    .reduce((acc, curr) => acc + curr.calculatedInterest, 0);

  const totalNew = totalOriginal + totalFines + totalInterest;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">Multas e Juros de Mora</DialogTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Calcular penalidades por atraso</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Configurações de Taxas */}
          <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Multa Fixa (%)</Label>
              <Input 
                type="number" 
                value={config.finePercent} 
                onChange={e => setConfig({ ...config, finePercent: Number(e.target.value) })}
                className="h-10 rounded-xl bg-white border-slate-200 font-bold text-center text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Juros Mensais (%)</Label>
              <Input 
                type="number" 
                value={config.interestMonthly} 
                onChange={e => setConfig({ ...config, interestMonthly: Number(e.target.value) })}
                className="h-10 rounded-xl bg-white border-slate-200 font-bold text-center text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Carência (Dias)</Label>
              <Input 
                type="number" 
                value={config.gracePeriod} 
                onChange={e => setConfig({ ...config, gracePeriod: Number(e.target.value) })}
                className="h-10 rounded-xl bg-white border-slate-200 font-bold text-center text-sm"
              />
            </div>
          </div>

          {/* Lista de Faturas */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Selecione as faturas para aplicar</Label>
            
            {loading ? (
              <div className="py-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              </div>
            ) : calculatedBills.length > 0 ? (
              <div className="space-y-3">
                {calculatedBills.map(bill => (
                  <div 
                    key={bill.id} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col gap-3",
                      selectedBillIds.includes(bill.id) ? "bg-rose-50/30 border-rose-100" : "bg-slate-50 border-slate-100 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedBillIds.includes(bill.id)}
                          onCheckedChange={(checked) => {
                            setSelectedBillIds(prev => 
                              checked ? [...prev, bill.id] : prev.filter(id => id !== bill.id)
                            );
                          }}
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900 capitalize">{bill.type} ({bill.month}/{bill.year})</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Vencimento: {bill.dueDate.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          "border-none text-[9px] font-black px-2 py-0.5 rounded-md",
                          bill.daysLate > config.gracePeriod ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {bill.daysLate} dias de atraso
                        </Badge>
                      </div>
                    </div>

                    {selectedBillIds.includes(bill.id) && (
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-dashed border-rose-100/50 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Valor Base</p>
                          <p className="font-bold text-slate-700">R$ {bill.baseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-rose-500 font-bold uppercase">Multa ({config.finePercent}%)</p>
                          <p className="font-bold text-rose-600">+ R$ {bill.calculatedFine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-rose-500 font-bold uppercase">Juros ({config.interestMonthly}% mês)</p>
                          <p className="font-bold text-rose-600">+ R$ {bill.calculatedInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">Nenhuma fatura pendente encontrada.</p>
              </div>
            )}
          </div>

          {/* Resumo Geral */}
          {selectedBillIds.length > 0 && (
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-3 shadow-xl">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>VALOR ORIGINAL ACUMULADO</span>
                <span>R$ {totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-400">
                <span>TOTAL MULTAS</span>
                <span>+ R$ {totalFines.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-400">
                <span>TOTAL JUROS</span>
                <span>+ R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-wider">VALOR ATUALIZADO</span>
                <span className="text-2xl font-black text-blue-400">R$ {totalNew.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button 
              onClick={handleApply} 
              disabled={updating || selectedBillIds.length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-rose-100 flex-1"
            >
              {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Aplicar Multas e Juros
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};