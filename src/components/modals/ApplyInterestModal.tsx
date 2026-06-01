"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Percent, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { InterestSettingsForm } from './apply-interest/InterestSettingsForm';
import { BillSelectionList } from './apply-interest/BillSelectionList';
import { PenaltySummary } from './apply-interest/PenaltySummary';

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
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, { fine: string, interest: string }>>({});

  // Configurações de cálculo locais (ajustáveis diretamente no modal)
  const [config, setConfig] = useState({
    finePercent: 12,
    interestRate: 1,
    interestType: 'weekly' as 'daily' | 'weekly' | 'monthly',
    gracePeriod: 0
  });

  // Carregar configurações padrão do localStorage ao abrir o modal
  useEffect(() => {
    const savedConfig = localStorage.getItem('aluguei_financial_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          finePercent: parsed.finePercent ?? 12,
          interestRate: parsed.interestRate ?? 1,
          interestType: parsed.interestType ?? 'weekly',
          gracePeriod: parsed.gracePeriod ?? 0
        });
      } catch (e) {
        console.error("Erro ao carregar configurações financeiras no modal:", e);
      }
    }
  }, [isOpen]);

  // Carregar faturas pendentes, contratos ativos e projetar aluguéis do inquilino
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !tenantId) return;
      setLoading(true);
      try {
        const [billsRes, contractRes, tenantRes] = await Promise.all([
          supabase
            .from('bills')
            .select('*, properties(name)')
            .eq('tenant_id', tenantId)
            .neq('status', 'pago'),
          supabase
            .from('contracts')
            .select('*, properties(name)')
            .eq('tenant_id', tenantId)
            .eq('status', 'ativo'),
          supabase
            .from('tenants')
            .select('*, properties(*)')
            .eq('id', tenantId)
            .single()
        ]);

        if (billsRes.error) throw billsRes.error;
        if (contractRes.error) throw contractRes.error;
        if (tenantRes.error) throw tenantRes.error;

        const dbBills = billsRes.data || [];
        let activeContracts = contractRes.data || [];

        // FALLBACK: Se não houver contrato ativo mas houver imóvel vinculado diretamente
        if (activeContracts.length === 0 && tenantRes.data?.property_id) {
          activeContracts = [{
            property_id: tenantRes.data.property_id,
            rent_value: tenantRes.data.properties?.base_rent || 0,
            due_day: tenantRes.data.due_day || 5,
            status: 'ativo',
            properties: {
              name: tenantRes.data.properties?.name || 'Imóvel'
            }
          }];
        }

        const filteredBills = dbBills.filter(
          (b: any) => b.type !== 'multa' && b.type !== 'juros' && b.type !== 'multa_juros'
        );

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
              id: `projected-rent-${contract.id || 'fallback'}`,
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
        setManualAdjustments({});
        
        if (activeContracts.length > 0) {
          setActiveContract(activeContracts[0]);
        }
        
        setSelectedBillIds(allBills.map((b: any) => b.id));
      } catch (err: any) {
        showError('Erro ao carregar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, tenantId]);

  // Calcular multas e juros para cada fatura com base na frequência configurada
  const calculatedBills = useMemo(() => {
    const dueDay = activeContract?.due_day || 5;
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return bills.map(bill => {
      const baseValue = Number(bill.total_value || bill.calculated_value || 0);
      const dueDateMidnight = new Date(Number(bill.year), Number(bill.month) - 1, dueDay);
      
      const diffTime = todayMidnight.getTime() - dueDateMidnight.getTime();
      const daysLate = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

      let autoFine = 0;
      let autoInterest = 0;

      if (daysLate > config.gracePeriod) {
        // Multa fixa
        autoFine = Number((baseValue * (config.finePercent / 100)).toFixed(2));
        
        // Cálculo de juros baseado na frequência
        if (config.interestType === 'daily') {
          autoInterest = Number((baseValue * (config.interestRate / 100) * daysLate).toFixed(2));
        } else if (config.interestType === 'weekly') {
          const weeksLate = Math.floor(daysLate / 7);
          autoInterest = Number((baseValue * (config.interestRate / 100) * weeksLate).toFixed(2));
        } else if (config.interestType === 'monthly') {
          const monthsLate = Math.floor(daysLate / 30);
          autoInterest = Number((baseValue * (config.interestRate / 100) * monthsLate).toFixed(2));
        }
      }

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

      const totalFines = billsToUpdate.reduce((acc, curr) => acc + curr.calculatedFine, 0);
      const totalInterest = billsToUpdate.reduce((acc, curr) => acc + curr.calculatedInterest, 0);
      const totalPenalty = totalFines + totalInterest;

      if (totalPenalty > 0) {
        const now = new Date();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = now.getFullYear();

        const { data: existingPenaltyBill } = await supabase
          .from('bills')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('type', 'multa_juros')
          .eq('status', 'pendente')
          .maybeSingle();

        if (existingPenaltyBill) {
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

      showSuccess('Lançamento de multa e juros updated com sucesso!');
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
          {/* Configurações de Taxas Ajustáveis */}
          <InterestSettingsForm config={config} setConfig={setConfig} />

          {/* Lista de Faturas */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Selecione as faturas para aplicar</Label>
            <BillSelectionList 
              loading={loading}
              calculatedBills={calculatedBills}
              selectedBillIds={selectedBillIds}
              setSelectedBillIds={setSelectedBillIds}
              manualAdjustments={manualAdjustments}
              handleSaveAdjustment={handleSaveAdjustment}
            />
          </div>

          {/* Resumo Geral */}
          {selectedBillIds.length > 0 && (
            <PenaltySummary 
              totalOriginal={totalOriginal}
              totalFines={totalFines}
              totalInterest={totalInterest}
              totalPenalties={totalPenalties}
              totalNew={totalNew}
            />
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