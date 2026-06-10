"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { isBillOverdue } from '@/utils/financial';
import { BillingSummaryForm } from './billing-summary/BillingSummaryForm';
import { BillingSummaryPreview } from './billing-summary/BillingSummaryPreview';
import { ExtraValue } from './billing-summary/ExtraValuesList';
import { cn } from '@/lib/utils';

interface BillingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
}

type FilterType = 'all' | 'overdue' | 'current';

export const BillingSummaryModal = ({ isOpen, onClose, tenantId }: BillingSummaryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [pixKey, setPixKey] = useState('seu-pix@email.com');
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  
  // Dados brutos para cálculo reativo
  const [rawBills, setRawBills] = useState<any[]>([]);
  const [rawContracts, setRawContracts] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Valores calculados exibidos nos inputs
  const [rentValue, setRentValue] = useState('0');
  const [fineValue, setFineValue] = useState('0');
  const [interestValue, setInterestValue] = useState('0');
  const [extraValues, setExtraValues] = useState<ExtraValue[]>([]);
  const [sendMethod, setSendMethod] = useState<'whatsapp' | 'email'>('whatsapp');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [tenantsRes, userRes] = await Promise.all([
        supabase.from('tenants').select('id, name, phone, email').eq('status', 'ativo'),
        supabase.auth.getUser()
      ]);
      setTenants(tenantsRes.data || []);
      if (userRes.data.user?.user_metadata?.pix_key) setPixKey(userRes.data.user.user_metadata.pix_key);
      setLoading(false);
      if (tenantId) handleSelectTenant(tenantId);
    };
    if (isOpen) {
      fetchInitialData();
      setFilterType('all');
      setActiveTab('form');
    }
  }, [isOpen, tenantId]);

  const handleSelectTenant = async (id: string) => {
    setSelectedTenantId(id);
    try {
      setLoading(true);
      const [billsRes, contractsRes, tenantRes] = await Promise.all([
        supabase.from('bills').select('*').eq('tenant_id', id),
        supabase.from('contracts').select('rent_value, due_day, property_id, start_date, properties(name, condo_fee)').eq('tenant_id', id).eq('status', 'ativo'),
        supabase.from('tenants').select('*, properties(*)').eq('id', id).single()
      ]);

      setRawBills(billsRes.data || []);
      
      let contracts = contractsRes.data || [];
      // FALLBACK: Se não houver contrato ativo mas houver imóvel vinculado diretamente
      if (contracts.length === 0 && tenantRes.data?.property_id) {
        contracts = [{
          property_id: tenantRes.data.property_id,
          rent_value: tenantRes.data.properties?.base_rent || 0,
          due_day: tenantRes.data.due_day || 5,
          status: 'ativo',
          properties: {
            name: tenantRes.data.properties?.name || 'Imóvel',
            condo_fee: tenantRes.data.properties?.condo_fee || 0
          }
        }];
      }
      setRawContracts(contracts);
    } catch (err) {
      showError('Erro ao carregar débitos.');
    } finally {
      setLoading(false);
    }
  };

  // Recalcula os valores de cobrança sempre que os dados brutos ou o filtro mudarem
  useEffect(() => {
    if (rawBills.length === 0 && rawContracts.length === 0) {
      setRentValue('0');
      setFineValue('0');
      setInterestValue('0');
      setExtraValues([]);
      return;
    }

    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const currentDay = new Date().getDate();

    // Coletar todos os meses únicos que possuem faturas ou o mês atual
    const monthsToEvaluate = new Set<string>();
    monthsToEvaluate.add(`${currentYear}-${currentMonth}`);
    rawBills.forEach(b => {
      if (b.month && b.year) {
        monthsToEvaluate.add(`${b.year}-${b.month.toString().padStart(2, '0')}`);
      }
    });

    let totalRentPending = 0;
    let totalFine = 0;
    let totalInterest = 0;
    const extras: ExtraValue[] = [];

    // 1. Processar Aluguéis de forma inteligente (com abatimento de pagamentos parciais)
    monthsToEvaluate.forEach(ym => {
      const [year, month] = ym.split('-');
      
      rawContracts.forEach(c => {
        const dueDay = c.due_day || 5;
        const isOverdue = currentDay >= dueDay;
        
        // Comparação de ano e mês direta para evitar bugs de fuso horário (timezone-safe)
        if (c.start_date) {
          const [cYear, cMonth] = c.start_date.split('-').map(Number);
          if (Number(year) < cYear || (Number(year) === cYear && Number(month) < cMonth)) {
            return;
          }
        }

        // Filtros de escopo
        if (filterType === 'current' && (Number(month) !== Number(currentMonth) || Number(year) !== currentYear)) return;
        if (filterType === 'overdue') {
          const isCurrentOverdue = (Number(month) === Number(currentMonth) && Number(year) === currentYear && isOverdue);
          const isPastMonth = (Number(year) < currentYear || (Number(year) === currentYear && Number(month) < Number(currentMonth)));
          if (!isCurrentOverdue && !isPastMonth) return;
        }

        // Busca faturas de aluguel lançadas para este mês (usando Number para evitar erros de "02" vs "2")
        // Permite correspondência mesmo se o property_id for nulo no lançamento
        const rentBills = rawBills.filter(b => 
          (b.property_id === c.property_id || !b.property_id || !c.property_id) && 
          (b.type?.toLowerCase() === 'aluguel' || b.type?.toLowerCase() === 'receita') && 
          Number(b.month) === Number(month) && 
          Number(b.year) === Number(year)
        );

        const paidRent = rentBills.filter(b => b.status === 'pago').reduce((acc, b) => acc + Number(b.total_value || b.calculated_value || 0), 0);
        
        // O que resta pagar é o valor do contrato menos o que já foi pago
        const remaining = Math.max(0, c.rent_value - paidRent);
        
        if (remaining > 0) {
          totalRentPending += remaining;
        }
      });
    });

    // 2. Processar outras faturas (utilidades, multas, juros)
    const filteredBills = rawBills.filter(b => {
      const contract = rawContracts.find(c => c.property_id === b.property_id);
      const isOverdue = isBillOverdue(b, contract?.due_day || 5);
      const isCurrentMonth = Number(b.month) === Number(currentMonth) && Number(b.year) === Number(currentYear);

      if (filterType === 'overdue') return isOverdue;
      if (filterType === 'current') return isCurrentMonth;
      return true;
    });

    const groups: Record<string, { paid: number, pending: number, type: string, month: string, year: string, property_id: string }> = {};
    
    filteredBills.filter(b => b.type !== 'aluguel' && b.type !== 'receita').forEach(b => {
      const key = `${b.property_id || 'none'}-${b.type}-${Number(b.month)}-${b.year}`;
      if (!groups[key]) {
        groups[key] = { paid: 0, pending: 0, type: b.type, month: b.month, year: b.year, property_id: b.property_id };
      }
      const val = Number(b.total_value || b.calculated_value || 0);
      if (b.status === 'pago') {
        groups[key].paid += val;
      } else {
        groups[key].pending += val;
      }
    });

    Object.keys(groups).forEach(key => {
      const group = groups[key];
      const netPending = Math.max(0, group.pending - group.paid);
      
      if (netPending > 0) {
        if (group.type === 'multa') {
          totalFine += netPending;
        } else if (group.type === 'juros') {
          totalInterest += netPending;
        } else if (group.type === 'multa_juros') {
          extras.push({
            label: `Multa e Juros Acumulados`,
            value: netPending.toString()
          });
        } else {
          const originalBill = rawBills.find(b => 
            b.property_id === group.property_id && 
            b.type === group.type && 
            Number(b.month) === Number(group.month) && 
            Number(b.year) === Number(group.year) && 
            b.status !== 'pago'
          );

          let consumption = '';
          if (originalBill && originalBill.current_reading !== null && originalBill.previous_reading !== null) {
            consumption = (Number(originalBill.current_reading) - Number(originalBill.previous_reading)).toString();
          }

          extras.push({
            label: `${group.type.charAt(0).toUpperCase() + group.type.slice(1)} (${group.month}/${group.year})`,
            value: netPending.toString(),
            quantity: consumption,
            unitPrice: originalBill?.kwh_price?.toString() || ''
          });
        }
      }
    });

    setRentValue(totalRentPending.toString());
    setFineValue(totalFine.toString());
    setInterestValue(totalInterest.toString());
    setExtraValues(extras);

  }, [rawBills, rawContracts, filterType]);

  const handleUpdateExtra = (index: number, field: keyof ExtraValue, val: string) => {
    const newExtras = [...extraValues];
    newExtras[index] = { ...newExtras[index], [field]: val };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(newExtras[index].quantity || '0');
      const p = parseFloat(newExtras[index].unitPrice || '0');
      if (q > 0 && p > 0) {
        newExtras[index].value = (q * p).toFixed(2);
      }
    }
    setExtraValues(newExtras);
  };

  const total = useMemo(() => {
    const rent = parseFloat(rentValue) || 0;
    const fine = parseFloat(fineValue) || 0;
    const interest = parseFloat(interestValue) || 0;
    const extras = extraValues.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
    return rent + fine + interest + extras;
  }, [rentValue, fineValue, interestValue, extraValues]);

  const generatedMessage = useMemo(() => {
    const tenantObj = tenants.find(t => t.id === selectedTenantId);
    const fine = parseFloat(fineValue) || 0;
    const interest = parseFloat(interestValue) || 0;
    
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const currentDay = new Date().getDate();

    // Coletar todos os meses únicos para detalhar no preview
    const monthsToEvaluate = new Set<string>();
    monthsToEvaluate.add(`${currentYear}-${currentMonth}`);
    rawBills.forEach(b => {
      if (b.month && b.year) {
        monthsToEvaluate.add(`${b.year}-${b.month.toString().padStart(2, '0')}`);
      }
    });

    let details = '';

    monthsToEvaluate.forEach(ym => {
      const [year, month] = ym.split('-');
      
      rawContracts.forEach(c => {
        const dueDay = c.due_day || 5;
        const isOverdue = currentDay >= dueDay;
        
        // Comparação de ano e mês direta para evitar bugs de fuso horário (timezone-safe)
        if (c.start_date) {
          const [cYear, cMonth] = c.start_date.split('-').map(Number);
          if (Number(year) < cYear || (Number(year) === cYear && Number(month) < cMonth)) {
            return;
          }
        }

        if (filterType === 'current' && (Number(month) !== Number(currentMonth) || Number(year) !== currentYear)) return;
        if (filterType === 'overdue') {
          const isCurrentOverdue = (Number(month) === Number(currentMonth) && Number(year) === currentYear && isOverdue);
          const isPastMonth = (Number(year) < currentYear || (Number(year) === currentYear && Number(month) < Number(currentMonth)));
          if (!isCurrentOverdue && !isPastMonth) return;
        }

        const rentBills = rawBills.filter(b => 
          (b.property_id === c.property_id || !b.property_id || !c.property_id) && 
          (b.type?.toLowerCase() === 'aluguel' || b.type?.toLowerCase() === 'receita') && 
          Number(b.month) === Number(month) && 
          Number(b.year) === Number(year)
        );

        const paidRent = rentBills.filter(b => b.status === 'pago').reduce((acc, b) => acc + Number(b.total_value || b.calculated_value || 0), 0);
        const remaining = Math.max(0, c.rent_value - paidRent);

        if (remaining > 0) {
          if (paidRent > 0) {
            details += `• *Aluguel (${month}/${year}):* R$ ${c.rent_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Abatido: R$ ${paidRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) -> *Restante:* R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
          } else {
            details += `• *Aluguel (${month}/${year}):* R$ ${c.rent_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
          }
        }
      });
    });

    if (fine > 0) details += `• *Multa por Atraso:* R$ ${fine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (interest > 0) details += `• *Juros de Mora:* R$ ${interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    extraValues.forEach(e => {
      const val = parseFloat(e.value) || 0;
      if (val > 0) {
        const consumptionInfo = e.quantity ? ` (${e.quantity} kWh)` : '';
        details += `• *${e.label}:* R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${consumptionInfo}\n`;
      }
    });

    const saudacao = `Olá ${tenantObj?.name || 'Inquilino'}! 👋`;
    const intro = filterType === 'overdue' 
      ? `Estou enviando o resumo dos seus valores em atraso pendentes de regularização:`
      : filterType === 'current'
      ? `Estou enviando o resumo do aluguel e utilidades deste mês:`
      : `Estou enviando o resumo consolidado de todos os seus valores pendentes:`;

    const totalStr = `💰 *Total a pagar: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*`;
    const pixStr = `🔑 *Chave PIX:* ${pixKey}`;
    const despedida = `Qualquer dúvida, estou à disposição!`;

    return `${saudacao}\n\n${intro}\n\n${details}\n${totalStr}\n\n${pixStr}\n\n${despedida}`;
  }, [selectedTenantId, rentValue, fineValue, interestValue, extraValues, pixKey, total, tenants, filterType, rawBills, rawContracts]);

  const handleSend = () => {
    const tenantObj = tenants.find(t => t.id === selectedTenantId);
    if (!tenantObj) return;

    if (sendMethod === 'whatsapp') {
      const phone = tenantObj.phone?.replace(/\D/g, '');
      const encodedText = encodeURIComponent(generatedMessage);
      window.open(`https://wa.me/${phone || ''}?text=${encodedText}`, '_blank');
    } else {
      const email = tenantObj.email;
      if (!email) {
        showError('Inquilino não possui e-mail cadastrado.');
        return;
      }
      const subject = encodeURIComponent('Resumo de Aluguel - Aluguei.Online');
      const body = encodeURIComponent(generatedMessage.replace(/\*/g, ''));
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[900px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[95vh] md:max-h-[90vh] flex flex-col">
        {/* Seletor de Abas para Celular */}
        <div className="flex md:hidden bg-slate-100 p-1.5 m-4 mb-0 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all",
              activeTab === 'form' ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
            )}
          >
            1. Configurar Valores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all",
              activeTab === 'preview' ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
            )}
          >
            2. Ver Mensagem
          </button>
        </div>

        <div className="flex-1 flex flex-col md:grid md:grid-cols-2 h-[75vh] md:h-[620px] overflow-hidden">
          {/* Coluna 1: Formulário */}
          <div className={cn("h-full flex-col overflow-hidden md:flex", activeTab === 'form' ? 'flex' : 'hidden')}>
            <BillingSummaryForm 
              tenants={tenants}
              selectedTenantId={selectedTenantId}
              onSelectTenant={handleSelectTenant}
              loading={loading}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              rentValue={rentValue}
              onRentValueChange={setRentValue}
              fineValue={fineValue}
              onFineValueChange={setFineValue}
              interestValue={interestValue}
              onInterestValueChange={setInterestValue}
              extraValues={extraValues}
              onAddExtra={() => setExtraValues([...extraValues, { label: '', value: '0' }])}
              onRemoveExtra={(index) => setExtraValues(extraValues.filter((_, i) => i !== index))}
              onUpdateExtra={handleUpdateExtra}
              total={total}
            />
          </div>

          {/* Coluna 2: Preview */}
          <div className={cn("h-full flex-col overflow-hidden md:flex", activeTab === 'preview' ? 'flex' : 'hidden')}>
            <BillingSummaryPreview 
              generatedMessage={generatedMessage}
              sendMethod={sendMethod}
              onSendMethodChange={setSendMethod}
              onSend={handleSend}
              onCopy={() => { navigator.clipboard.writeText(generatedMessage); showSuccess('Copiado!'); }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};