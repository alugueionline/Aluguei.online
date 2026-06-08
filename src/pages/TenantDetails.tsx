"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, MessageSquare, Percent, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TenantModal } from '@/components/modals/TenantModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { ApplyInterestModal } from '@/components/modals/ApplyInterestModal';
import { BillingModal } from '@/components/modals/BillingModal';
import { TenantProfileCard } from '@/components/tenant-details/TenantProfileCard';
import { TenantPropertiesList } from '@/components/tenant-details/TenantPropertiesList';
import { TenantPaymentHistory } from '@/components/tenant-details/TenantPaymentHistory';
import { showSuccess, showError } from '@/utils/toast';
import { isBillOverdue, getProjectedRent } from '@/utils/financial';

type HistoryFilter = 'all' | 'pending' | 'paid';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isSingleBillModalOpen, setIsSingleBillModalOpen] = useState(false);
  const [selectedBillForEdit, setSelectedBillForEdit] = useState<any>(null);
  const [processingBillId, setProcessingBillId] = useState<string | null>(null);
  
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`*, properties(*), contracts (*, properties (*))`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: financialData } = useQuery({
    queryKey: ['tenant-financial-v6', id],
    queryFn: async () => {
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('tenant_id', id)
        .order('year', { descending: true })
        .order('month', { descending: true });
      
      const history = bills || [];
      const displayHistory = [...history];
      
      let totalDebt = 0;
      let totalOverdue = 0;
      let totalPaid = 0;

      let activeContracts = tenant?.contracts?.filter((c: any) => c.status === 'ativo') || [];
      
      if (activeContracts.length === 0 && tenant?.property_id) {
        activeContracts = [{
          property_id: tenant.property_id,
          rent_value: tenant.properties?.base_rent || 0,
          due_day: tenant.due_day || 5,
          status: 'ativo',
          properties: {
            condo_fee: tenant.properties?.condo_fee || 0,
            name: tenant.properties?.name || 'Imóvel'
          }
        }];
      }

      const groups: Record<string, { paid: number, pending: number, bills: any[] }> = {};
      history.forEach(b => {
        const key = `${b.property_id || 'none'}-${b.type}-${b.month}-${b.year}`;
        if (!groups[key]) {
          groups[key] = { paid: 0, pending: 0, bills: [] };
        }
        const val = Number(b.total_value || b.calculated_value || 0);
        if (b.status === 'pago') {
          groups[key].paid += val;
          totalPaid += val;
        } else {
          groups[key].pending += val;
        }
        groups[key].bills.push(b);
      });

      Object.keys(groups).forEach(key => {
        const group = groups[key];
        const netPending = Math.max(0, group.pending - group.paid);
        if (netPending > 0) {
          totalDebt += netPending;
          const firstBill = group.bills.find(b => b.status !== 'pago') || group.bills[0];
          const contract = activeContracts.find((c: any) => c.property_id === firstBill.property_id);
          if (isBillOverdue(firstBill, contract?.due_day || 5)) {
            totalOverdue += netPending;
          }
        }
      });

      if (activeContracts.length > 0) {
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = now.getFullYear();

        activeContracts.forEach((contract: any) => {
          const dueDay = contract.due_day || 5;
          const projected = getProjectedRent(contract, history);
          
          if (projected > 0) {
            totalDebt += projected;
            const isOverdue = currentDay > dueDay;
            if (isOverdue) totalOverdue += projected;
            
            displayHistory.unshift({
              id: `auto-rent-${contract.id || 'fallback'}-${currentMonth}-${currentYear}`,
              type: 'aluguel',
              month: currentMonth,
              year: currentYear,
              total_value: projected,
              status: 'pendente',
              isAutoGenerated: true,
              property_id: contract.property_id
            });
          }
        });
      }

      displayHistory.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return parseInt(b.month) - parseInt(a.month);
      });

      return { history: displayHistory, totalDebt, totalOverdue, totalPaid };
    },
    enabled: !!tenant
  });

  const groupedHistory = useMemo(() => {
    if (!financialData?.history) return [];

    const groups: Record<string, { 
      key: string;
      month: string; 
      year: number; 
      bills: any[]; 
      total: number; 
      paid: number; 
      status: 'pago' | 'atrasado' | 'pendente' 
    }> = {};

    financialData.history.forEach(bill => {
      const key = `${bill.year}-${bill.month}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          month: bill.month,
          year: Number(bill.year),
          bills: [],
          total: 0,
          paid: 0,
          status: 'pago'
        };
      }

      const val = Number(bill.total_value || bill.calculated_value || 0);
      groups[key].bills.push(bill);
      groups[key].total += val;
      if (bill.status === 'pago') {
        groups[key].paid += val;
      }
    });

    return Object.values(groups).map(group => {
      const hasUnpaid = group.bills.some(b => b.status !== 'pago');
      let activeContracts = tenant?.contracts?.filter((c: any) => c.status === 'ativo') || [];
      if (activeContracts.length === 0 && tenant?.property_id) {
        activeContracts = [{ property_id: tenant.property_id, due_day: tenant.due_day || 5, status: 'ativo' }];
      }

      const contract = activeContracts[0];
      const hasOverdue = group.bills.some(b => isBillOverdue(b, contract?.due_day || 5));

      let status: 'pago' | 'atrasado' | 'pendente' = 'pago';
      if (hasUnpaid) {
        status = hasOverdue ? 'atrasado' : 'pendente';
      }

      return { ...group, status };
    }).filter(group => {
      if (historyFilter === 'pending') return group.status !== 'pago';
      if (historyFilter === 'paid') return group.status === 'pago';
      return true;
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return parseInt(b.month) - parseInt(a.month);
    });
  }, [financialData?.history, tenant, historyFilter]);

  useEffect(() => {
    if (groupedHistory.length > 0 && Object.keys(expandedMonths).length === 0) {
      setExpandedMonths({ [groupedHistory[0].key]: true });
    }
  }, [groupedHistory]);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkAsPaid = async (bill: any) => {
    setProcessingBillId(bill.id);
    try {
      if (bill.isAutoGenerated) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error: insertError } = await supabase.from('bills').insert([{
          user_id: user?.id,
          tenant_id: id,
          property_id: bill.property_id,
          type: 'aluguel',
          month: bill.month,
          year: bill.year,
          total_value: bill.total_value,
          status: 'pago',
          payment_date: new Date().toISOString()
        }]);
        if (insertError) throw insertError;
      } else {
        const { error } = await supabase.from('bills').update({ 
          status: 'pago', 
          payment_date: new Date().toISOString() 
        }).eq('id', bill.id);
        if (error) throw error;
      }
      
      showSuccess("Pagamento confirmado!");
      queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError("Erro ao dar baixa: " + err.message);
    } finally {
      setProcessingBillId(null);
    }
  };

  const handleRevertPayment = async (billId: string) => {
    setProcessingBillId(billId);
    try {
      const { error } = await supabase.from('bills').update({ status: 'pendente', payment_date: null }).eq('id', billId);
      if (error) throw error;
      showSuccess("Pagamento revertido.");
      queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError("Erro ao reverter: " + err.message);
    } finally {
      setProcessingBillId(null);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro permanentemente?")) return;
    setProcessingBillId(billId);
    try {
      const { error } = await supabase.from('bills').delete().eq('id', billId);
      if (error) throw error;
      showSuccess("Registro excluído.");
      queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError("Erro ao excluir: " + err.message);
    } finally {
      setProcessingBillId(null);
    }
  };

  const handleEditBill = (bill: any) => {
    setSelectedBillForEdit(bill);
    setIsSingleBillModalOpen(true);
  };

  if (isLoading) return <DashboardLayout><div className="h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /><p className="text-gray-500 font-medium">Carregando perfil...</p></div></DashboardLayout>;
  if (!tenant) return <DashboardLayout><div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Inquilino não encontrado</h2><Button onClick={() => navigate('/tenants')} className="mt-4">Voltar</Button></div></DashboardLayout>;

  let activeContracts = tenant.contracts?.filter((c: any) => c.status === 'ativo') || [];
  if (activeContracts.length === 0 && tenant.property_id) {
    activeContracts = [{ id: 'fallback', property_id: tenant.property_id, rent_value: tenant.properties?.base_rent || 0, due_day: tenant.due_day || 5, status: 'ativo', properties: { name: tenant.properties?.name || 'Imóvel', condo_fee: tenant.properties?.condo_fee || 0 } }];
  }

  return (
    <DashboardLayout title="Perfil do Inquilino">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Button variant="ghost" className="gap-2 text-gray-500 hover:text-gray-900" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button onClick={() => setIsInterestModalOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold gap-2 shadow-lg shadow-rose-100 flex-1 md:flex-none"><Percent className="w-4 h-4" /> Multas e Juros</Button>
          <Button onClick={() => setIsBillingModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold gap-2 shadow-lg shadow-emerald-100 flex-1 md:flex-none"><MessageSquare className="w-4 h-4" /> Cobrar Inquilino</Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2 flex-1 md:flex-none"><Edit2 className="w-4 h-4" /> Editar Perfil</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1"><TenantProfileCard tenant={tenant} financialData={financialData} /></div>
        <div className="lg:col-span-2 space-y-6">
          <TenantPropertiesList activeContracts={activeContracts} />
          <TenantPaymentHistory groupedHistory={groupedHistory} expandedMonths={expandedMonths} onToggleMonth={toggleMonth} historyFilter={historyFilter} onFilterChange={setHistoryFilter} processingBillId={processingBillId} onMarkAsPaid={handleMarkAsPaid} onRevertPayment={handleRevertPayment} onDeleteBill={handleDeleteBill} onEditBill={handleEditBill} activeContracts={activeContracts} isBillOverdue={isBillOverdue} />
        </div>
      </div>
      <TenantModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ key: ['tenant', id] }); }} tenant={tenant} />
      <BillingSummaryModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} tenantId={id} />
      <ApplyInterestModal 
        isOpen={isInterestModalOpen} 
        onClose={() => setIsInterestModalOpen(false)} 
        tenantId={id || ''} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] });
          queryClient.invalidateQueries({ queryKey: ['bills'] });
        }}
      />
      <BillingModal 
        isOpen={isSingleBillModalOpen} 
        onClose={() => { 
          setIsSingleBillModalOpen(false); 
          setSelectedBillForEdit(null); 
          queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] }); 
          queryClient.invalidateQueries({ queryKey: ['bills'] });
        }} 
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] });
          queryClient.invalidateQueries({ queryKey: ['bills'] });
        }}
        bill={selectedBillForEdit} 
      />
    </DashboardLayout>
  );
};

export default TenantDetails;