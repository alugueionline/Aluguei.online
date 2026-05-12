"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  onSuccess: () => void;
}

export const QuickPaymentModal = ({ isOpen, onClose, tenant, onSuccess }: QuickPaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && tenant) {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();
      
      const pendingBills = tenant.bills?.filter((b: any) => b.status !== 'pago') || [];
      const formattedItems = pendingBills.map((b: any) => ({
        id: b.id,
        label: `${b.type.charAt(0).toUpperCase() + b.type.slice(1)} (${b.month}/${b.year})`,
        value: Number(b.calculated_value || b.total_value),
        isExisting: true,
        type: b.type,
        month: b.month,
        year: b.year
      }));

      // Verificar se o aluguel do mês atual precisa ser projetado para cada contrato ativo
      const activeContracts = tenant.contracts?.filter((c: any) => c.status === 'ativo') || [];
      
      activeContracts.forEach((contract: any) => {
        const hasRentBill = tenant.bills?.some((b: any) => 
          b.type === 'aluguel' && 
          b.month === currentMonth && 
          b.year === currentYear && 
          b.property_id === contract.property_id
        );

        if (!hasRentBill) {
          // CORREÇÃO: ID único incluindo o property_id para evitar conflitos em múltiplos contratos
          formattedItems.unshift({
            id: `projected-rent-${tenant.id}-${contract.property_id}`,
            label: `Aluguel (${currentMonth}/${currentYear}) - ${contract.properties?.name || 'Imóvel'}`,
            value: Number(contract.rent_value),
            isExisting: false,
            type: 'aluguel',
            month: currentMonth,
            year: currentYear,
            property_id: contract.property_id
          });
        }
      });

      setItems(formattedItems);
      setSelectedSelectedIds(formattedItems.map(i => i.id));
    }
  }, [isOpen, tenant]);

  const handleConfirm = async () => {
    if (selectedIds.length === 0) {
      showError("Selecione pelo menos um item para dar baixa.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const selectedItems = items.filter(i => selectedIds.includes(i.id));
      
      // 1. Atualizar contas que já existem
      const existingIds = selectedItems.filter(i => i.isExisting).map(i => i.id);
      if (existingIds.length > 0) {
        const { error } = await supabase
          .from('bills')
          .update({ status: 'pago', payment_date: new Date().toISOString() })
          .in('id', existingIds);
        if (error) throw error;
      }

      // 2. Criar e pagar contas projetadas
      const projectedItems = selectedItems.filter(i => !i.isExisting);
      if (projectedItems.length > 0) {
        const billsToInsert = projectedItems.map(i => ({
          user_id: user?.id,
          tenant_id: tenant.id,
          property_id: i.property_id,
          type: i.type,
          month: i.month,
          year: i.year,
          total_value: i.value,
          status: 'pago',
          payment_date: new Date().toISOString()
        }));

        const { error } = await supabase.from('bills').insert(billsToInsert);
        if (error) throw error;
      }

      showSuccess("Pagamentos confirmados com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError("Erro ao processar baixa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSelected = items
    .filter(i => selectedIds.includes(i.id))
    .reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Confirmar Recebimento</DialogTitle>
          <p className="text-sm text-slate-500 font-medium">Selecione o que o inquilino <b>{tenant?.name}</b> pagou hoje.</p>
        </DialogHeader>

        <div className="py-6 space-y-3">
          {items.length > 0 ? items.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                selectedIds.includes(item.id) ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100 opacity-60"
              )}
              onClick={() => {
                if (selectedIds.includes(item.id)) {
                  setSelectedSelectedIds(selectedIds.filter(id => id !== item.id));
                } else {
                  setSelectedSelectedIds([...selectedIds, item.id]);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={selectedIds.includes(item.id)} />
                <span className="font-bold text-slate-900 text-sm">{item.label}</span>
              </div>
              <span className="font-black text-blue-600 text-sm">
                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )) : (
            <div className="text-center py-10 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Nenhum débito pendente encontrado.</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-900 rounded-2xl text-white flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest">Total a Receber</span>
          </div>
          <span className="text-xl font-black text-blue-400">
            R$ {totalSelected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || selectedIds.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 font-black h-12 shadow-lg shadow-emerald-100 flex-1"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};