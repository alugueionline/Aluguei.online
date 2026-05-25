"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Percent, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
  
  // Estado para armazenar ajustes manuais de multa e juros por fatura
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, { fine: string, interest: string }>>({});

  // Configurações de cálculo (padrão do sistema - multa alterada para 12% e juros mensais removidos/zerados)
  const [config, setConfig] = useState({
    finePercent: 12,
    interestMonthly: 0,
    gracePeriod: 0
  });

  // Carregar faturas pendentes, contratos ativos e projetar aluguéis do inquilino
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
            .select('*, properties(name)')
            .eq('tenant_id', tenantId)
            .eq('status', 'ativo')
        ]);

        if (billsRes.error) throw billsRes.error;
        if (contractRes.error) throw contractRes.error;

        const dbBills = billsRes.data || [];
        const activeContracts = contractRes.data || [];

        // Filtrar para não aplicar juros sobre juros/multas já existentes
        const filteredBills = dbBills.filter(
          (b: any) => b.type !== 'multa' && b.type !== 'juros' && b.type !== 'multa_juros'
        );

        // Projetar aluguel se não houver fatura no banco para o mês atual
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear();

        const projectedBills: any[] = [];
        activeContracts.forEach((contract: any) => {
          const hasRentBill = dbBills.some(b => 
            b.type === 'aluguel' && 
            b.month === currentMonth && 
            b.year === currentYear && 
            b.property_id === contract.property_id
          );

          if (!hasRentBill) {
            projectedBills.push({
              id: `projected-rent-${contract.id}`,
              tenant_id: tenantId,
              property_id: contract.property_id,
              type: 'aluguel',
              month: currentMonth,
              year: currentYear,
              total_value: Number(contract.rent_value || 0),
              status: 'pendente',
              isProjected: true,
              properties: {
                name: contract.properties?.name || 'Imóvel'
              }
            });
          }
        });

        const allBills = [...filteredBills, ...projectedBills];
        setBills(allBills);
        setManualAdjustments({}); // Limpa ajustes anteriores
        
        if (activeContracts.length > 0) {
          setActiveContract(activeContracts[0]); // Para fins de configuração padrão de vencimento
        }
        
        // Selecionar todas por padrão
        setSelectedBillIds(allBills.map((b: any) => b.id));
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
    // Normaliza a data atual para meia-noite local
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return bills.map(bill => {
      const baseValue = Number(bill.total_value || bill.calculated_value || 0);
      
      // Normaliza a data de vencimento estimada para meia-noite local
      const dueDateMidnight = new Date(Number(bill.year), Number(bill.month) - 1, dueDay);
      
      // Dias de atraso exatos (usando arredondamento para evitar problemas de fuso horário)
      const diffTime = todayMidnight.getTime() - dueDateMidnight.getTime();
      const daysLate = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

      let autoFine = 0;
      let autoInterest = 0;

      // Se o atraso for maior que a carência configurada
      if (daysLate > config.gracePeriod) {
        // Arredonda para 2 casas decimais para evitar dízimas periódicas
        autoFine = Number((baseValue * (config.finePercent / 100)).toFixed(2));
        // Juros pro-rata die (diário) baseado na taxa mensal
        const dailyInterestRate = (config.interestMonthly / 30) / 100;
        autoInterest = Number((baseValue * dailyInterestRate * daysLate).toFixed(2));
      }

      // Aplica ajuste manual se existir, senão usa o valor calculado automaticamente
      const adjustment = manualAdjustments[bill.id];
      const fine = adjustment?.fine !== undefined ? (parseFloat(adjustment.fine) || 0) : autoFine;
      const interest = adjustment?.interest !== undefined ? (parseFloat(adjustment.interest) || 0) : autoInterest;

      const totalUpdated = baseValue + fine + interest;

      return {
        ...bill,
        baseValue,
        dueDate: dueDateMidnight,
        daysLate,
        calculatedFine: fine,
        calculatedInterest: interest,
        autoFine,
        autoInterest,
        totalUpdated
      };
    });
  }, [bills, activeContract, config, manualAdjustments]);

  const handleSaveAdjustment = (billId: string, field: 'fine' | 'interest', value: string) => {
    setManualAdjustments(prev => ({
      ...prev,
      [billId]: {
        fine: field === 'fine' ? value : (prev[billId]?.fine ?? calculatedBills.find(b => b.id === billId)?.autoFine.toString() ?? '0'),
        interest: field === 'interest' ? value : (prev[billId]?.interest ?? calculatedBills.find(b => b.id === billId)?.autoInterest.toString() ?? '0')
      }
    }));
  };

  const handleApply = async () => {
    if (selectedBillIds.length === 0) {
      showError('Selecione pelo menos uma fatura para aplicar.');
      return;
    }

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const billsToUpdate = calculatedBills.filter(b => selectedBillIds.includes(b.id));

      // 1. Se houver faturas projetadas selecionadas, precisamos criá-las no banco primeiro
      const projectedBills = billsToUpdate.filter(b => b.isProjected);
      for (const proj of projectedBills) {
        const { error: insertProjError } = await supabase
          .from('bills')
          .insert([{
            user_id: user.id,
            tenant_id: tenantId,
            property_id: proj.property_id,
            type: 'aluguel',
            month: proj.month,
            year: proj.year,
            total_value: proj.baseValue,
            status: proj.daysLate > 0 ? 'atrasado' : 'pendente'
          }]);

        if (insertProjError) throw insertProjError;
      }

      // 2. Atualizar faturas que já existiam no banco para status 'atrasado' se tiverem dias de atraso
      const existingBills = billsToUpdate.filter(b => !b.isProjected);
      const updatePromises = existingBills.map(b => {
        return supabase
          .from('bills')
          .update({
            status: b.daysLate > 0 ? 'atrasado' : b.status
          })
          .eq('id', b.id);
      });

      if (updatePromises.length > 0) {
        const updateResults = await Promise.all(updatePromises);
        const updateError = updateResults.find(r => r.error);
        if (updateError) throw updateError.error;
      }

      // 3. Calcular o total consolidado de multas e juros
      const totalFines = billsToUpdate.reduce((acc, curr) => acc + curr.calculatedFine, 0);
      const totalInterest = billsToUpdate.reduce((acc, curr) => acc + curr.calculatedInterest, 0);
      const totalPenalty = totalFines + totalInterest;

      // 4. Criar ou atualizar a fatura consolidada de multa_juros
      if (totalPenalty > 0) {
        const now = new Date();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = now.getFullYear();

        // Verificar se já existe uma fatura de multa_juros pendente para este inquilino
        const { data: existingPenaltyBill } = await supabase
          .from('bills')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('type', 'multa_juros')
          .eq('status', 'pendente')
          .maybeSingle();

        if (existingPenaltyBill) {
          // Atualiza o valor da fatura existente
          const { error: updatePenaltyError } = await supabase
            .from('bills')
            .update({
              total_value: totalPenalty,
              calculated_value: totalPenalty,
              month: currentMonth,
              year: currentYear
            })
            .eq('id', existingPenaltyBill.id);

          if (updatePenaltyError) throw updatePenaltyError;
        } else {
          // Cria uma nova fatura de multa_juros
          const { error: insertPenaltyError } = await supabase
            .from('bills')
            .insert([{
              user_id: user.id,
              tenant_id: tenantId,
              property_id: activeContract?.property_id || billsToUpdate[0]?.property_id || null,
              type: 'multa_juros',
              month: currentMonth,
              year: currentYear,
              total_value: totalPenalty,
              calculated_value: totalPenalty,
              status: 'pendente'
            }]);

          if (insertPenaltyError) throw insertPenaltyError;
        }
      }

      showSuccess('Lançamento de multa e juros atualizado com sucesso!');
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

  const totalPenalties = totalFines + totalInterest;
  const totalNew = totalOriginal + totalPenalties;

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
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gerar lançamento único de penalidades</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Configurações de Taxas - Simplificado para Multa Fixa e Carência */}
          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
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
                {calculatedBills.map(bill => {
                  const isSelected = selectedBillIds.includes(bill.id);
                  const fineVal = manualAdjustments[bill.id]?.fine ?? bill.calculatedFine.toString();
                  const interestVal = manualAdjustments[bill.id]?.interest ?? bill.calculatedInterest.toString();

                  return (
                    <div 
                      key={bill.id} 
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col gap-3",
                        isSelected ? "bg-rose-50/30 border-rose-100" : "bg-slate-50 border-slate-100 opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              setSelectedBillIds(prev => 
                                checked ? [...prev, bill.id] : prev.filter(id => id !== bill.id)
                              );
                            }}
                          />
                          <div>
                            <p className="text-sm font-black text-slate-900 capitalize">
                              {bill.type} ({bill.month}/{bill.year})
                              {bill.isProjected && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-2 uppercase">Projetado</span>}
                            </p>
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

                      {isSelected && (
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-dashed border-rose-100/50 text-xs items-end">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Valor Base</p>
                            <p className="font-bold text-slate-700 h-10 flex items-center">R$ {bill.baseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-rose-500 font-bold uppercase mb-1">Multa (R$)</p>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-400">R$</span>
                              <Input 
                                type="number" 
                                step="0.01"
                                value={fineVal}
                                onChange={e => handleSaveAdjustment(bill.id, 'fine', e.target.value)}
                                className="h-10 pl-7 rounded-xl bg-white border-rose-100 font-bold text-rose-700 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] text-rose-500 font-bold uppercase mb-1">Juros (R$)</p>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-400">R$</span>
                              <Input 
                                type="number" 
                                step="0.01"
                                value={interestVal}
                                onChange={e => handleSaveAdjustment(bill.id, 'interest', e.target.value)}
                                className="h-10 pl-7 rounded-xl bg-white border-rose-100 font-bold text-rose-700 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">Nenhuma faturar pendente elegível encontrada.</p>
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
                <span>NOVAS MULTAS A GERAR</span>
                <span>+ R$ {totalFines.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-400">
                <span>NOVOS JUROS A GERAR</span>
                <span>+ R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {/* Linha de Destaque com a Soma das Penalidades */}
              <div className="pt-2 border-t border-dashed border-white/10 flex justify-between text-xs font-black text-amber-400">
                <span>TOTAL DE PENALIDADES (MULTA + JUROS)</span>
                <span>+ R$ {totalPenalties.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-wider">VALOR TOTAL ATUALIZADO</span>
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
              Gerar Lançamento Único de Penalidade
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};