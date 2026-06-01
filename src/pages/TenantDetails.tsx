"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Home,
  CreditCard,
  History,
  Loader2,
  CheckCircle2,
  Edit2,
  Building2,
  MessageSquare,
  RotateCcw,
  Wallet,
  Trash2,
  Check,
  AlertTriangle,
  CalendarClock,
  Percent,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { TenantModal } from '@/components/modals/TenantModal';
import { BillingSummaryModal } from '@/components/financial/BillingSummaryModal';
import { ApplyInterestModal } from '@/components/modals/ApplyInterestModal';
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
  const [processingBillId, setProcessingBillId] = useState<string | null>(null);
  
  // Filtro rápido de histórico
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  // Controle de meses expandidos (guarda a chave 'ano-mes')
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`*, contracts (*, properties (*))`)
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

      // Agrupar faturas por propriedade, tipo, mês e ano para compensação de pagamentos parciais
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

      // Calcular dívida líquida compensada
      Object.keys(groups).forEach(key => {
        const group = groups[key];
        const netPending = Math.max(0, group.pending - group.paid);
        if (netPending > 0) {
          totalDebt += netPending;
          const firstBill = group.bills.find(b => b.status !== 'pago') || group.bills[0];
          const contract = tenant?.contracts?.find((c: any) => c.property_id === firstBill.property_id);
          if (isBillOverdue(firstBill, contract?.due_day || 5)) {
            totalOverdue += netPending;
          }
        }
      });

      // 2. Incluir o aluguel do mês atual se ainda não foi gerado/pago e já passou do vencimento
      if (tenant?.contracts) {
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear();

        tenant.contracts.forEach((contract: any) => {
          if (contract.status === 'ativo') {
            const dueDay = contract.due_day || 5;
            if (currentDay >= dueDay) {
              const projected = getProjectedRent(contract, history);
              if (projected > 0) {
                totalDebt += projected;
                
                const isOverdue = currentDay > dueDay;
                
                if (isOverdue) {
                  totalOverdue += projected;
                }
                
                // Adiciona como um item normal na lista para o usuário
                displayHistory.unshift({
                  id: `auto-rent-${contract.id}`,
                  type: 'aluguel',
                  month: currentMonth,
                  year: currentYear,
                  total_value: projected,
                  status: 'pendente',
                  isAutoGenerated: true,
                  property_id: contract.property_id
                });
              }
            }
          }
        });
      }

      // Re-ordenar por data
      displayHistory.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return parseInt(b.month) - parseInt(a.month);
      });

      return { history: displayHistory, totalDebt, totalOverdue, totalPaid };
    },
    enabled: !!tenant
  });

  // Agrupamento inteligente do histórico por Mês/Ano
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

    // Determinar o status consolidado de cada mês e aplicar filtros rápidos
    return Object.values(groups).map(group => {
      const hasUnpaid = group.bills.some(b => b.status !== 'pago');
      const contract = tenant?.contracts?.find((c: any) => c.status === 'ativo');
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
  }, [financialData?.history, tenant?.contracts, historyFilter]);

  // Inicializa o primeiro mês como expandido por padrão
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v6'] });
      queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] });
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
    } catch (err: any) {
      showError("Erro ao excluir: " + err.message);
    } finally {
      setProcessingBillId(null);
    }
  };

  if (isLoading) return <DashboardLayout><div className="h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /><p className="text-gray-500 font-medium">Carregando perfil...</p></div></DashboardLayout>;
  if (!tenant) return <DashboardLayout><div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-900">Inquilino não encontrado</h2><Button onClick={() => navigate('/tenants')} className="mt-4">Voltar</Button></div></DashboardLayout>;

  const activeContracts = tenant.contracts?.filter((c: any) => c.status === 'ativo') || [];

  const getBillDescription = (bill: any) => {
    const type = bill.type?.toLowerCase();
    if (type === 'multa') return 'Multa por atraso de pagamento';
    if (type === 'juros') return 'Juros de mora pro-rata die';
    if (type === 'multa_juros') return 'Multa e Juros de Mora acumulados';
    if (type === 'manutencao') return 'Reparo ou manutenção de imóvel';
    if (type === 'aluguel') return 'Mensalidade de locação';
    return `Cobrança de ${bill.type}`;
  };

  const getMonthName = (monthStr: string) => {
    const months: Record<string, string> = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    return months[monthStr] || monthStr;
  };

  return (
    <DashboardLayout title="Perfil do Inquilino">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Button variant="ghost" className="gap-2 text-gray-500 hover:text-gray-900" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button 
            onClick={() => setIsInterestModalOpen(true)} 
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold gap-2 shadow-lg shadow-rose-100 flex-1 md:flex-none"
          >
            <Percent className="w-4 h-4" /> Multas e Juros
          </Button>
          <Button 
            onClick={() => setIsBillingModalOpen(true)} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold gap-2 shadow-lg shadow-emerald-100 flex-1 md:flex-none"
          >
            <MessageSquare className="w-4 h-4" /> Cobrar Inquilino
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2 flex-1 md:flex-none"
          >
            <Edit2 className="w-4 h-4" /> Editar Perfil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem]">
            <div className="h-32 bg-blue-600" />
            <CardContent className="relative pt-0">
              <div className="absolute -top-12 left-6"><div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg"><div className="w-full h-full rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><User className="w-12 h-12" /></div></div></div>
              <div className="pt-16 pb-6"><h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2><Badge className="mt-2 bg-green-50 text-green-700 border-none uppercase text-[10px] font-black">{tenant.status}</Badge></div>
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-3 text-gray-600"><Phone className="w-4 h-4 text-blue-600" /><span className="text-sm font-bold">{tenant.phone || 'Não informado'}</span></div>
                <div className="flex items-center gap-3 text-gray-600"><Mail className="w-4 h-4 text-blue-600" /><span className="text-sm font-bold">{tenant.email || 'Não informado'}</span></div>
                <div className="flex items-center gap-3 text-gray-600"><CreditCard className="w-4 h-4 text-blue-600" /><span className="text-sm font-bold">CPF: {tenant.cpf || 'Não informado'}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className={cn("border-none shadow-sm rounded-[2rem]", financialData?.totalOverdue && financialData.totalOverdue > 0 ? "bg-rose-50 border-rose-100" : "bg-white")}>
              <CardHeader className="pb-2"><CardTitle className={cn("text-sm font-black flex items-center gap-2 uppercase tracking-widest", financialData?.totalOverdue && financialData.totalOverdue > 0 ? "text-rose-800" : "text-slate-400")}>{financialData?.totalOverdue && financialData.totalOverdue > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} Dívida Atrasada</CardTitle></CardHeader>
              <CardContent><p className={cn("text-2xl font-black", financialData?.totalOverdue && financialData.totalOverdue > 0 ? "text-rose-900" : "text-slate-900")}>R$ {financialData?.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-blue-50 border-blue-100 rounded-[2rem]">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-black text-blue-800 flex items-center gap-2 uppercase tracking-widest"><Wallet className="w-4 h-4" /> Total Pago</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-black text-blue-900">R$ {financialData?.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" /> Imóveis Locados ({activeContracts.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContracts.map((contract: any) => (
                <Card key={contract.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-900 truncate">{contract.properties?.name}</h4><Badge variant="outline" className="text-[8px] font-black uppercase border-blue-100 text-blue-600">Vencimento: Dia {contract.due_day || '5'}</Badge></div>
                    <div className="flex justify-between items-end mt-4"><div><p className="text-[10px] text-slate-400 font-bold uppercase">Aluguel</p><p className="text-sm font-black text-blue-600">R$ {Number(contract.rent_value).toLocaleString('pt-BR')}</p></div><Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600" onClick={() => navigate(`/properties/${contract.properties?.id}`)}>Ver Imóvel</Button></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Histórico de Pagamentos Agrupado */}
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg font-black tracking-tight">Histórico de Pagamentos</CardTitle>
              </div>
              
              {/* Filtros Rápidos */}
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto">
                <button 
                  onClick={() => setHistoryFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    historyFilter === 'all' ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setHistoryFilter('pending')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    historyFilter === 'pending' ? "bg-white shadow-sm text-rose-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Pendentes
                </button>
                <button 
                  onClick={() => setHistoryFilter('paid')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    historyFilter === 'paid' ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Pagos
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {groupedHistory.length > 0 ? (
                groupedHistory.map((group) => {
                  const isExpanded = !!expandedMonths[group.key];
                  
                  return (
                    <div 
                      key={group.key} 
                      className={cn(
                        "border rounded-[2rem] overflow-hidden transition-all",
                        group.status === 'atrasado' ? "border-rose-100 bg-rose-50/10" : "border-slate-100 bg-white"
                      )}
                    >
                      {/* Cabeçalho do Mês (Sanfona) */}
                      <div 
                        onClick={() => toggleMonth(group.key)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                            group.status === 'pago' ? "bg-emerald-50 text-emerald-600" :
                            group.status === 'atrasado' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                          )}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base tracking-tight">
                              {getMonthName(group.month)} de {group.year}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                              {group.bills.length} {group.bills.length === 1 ? 'lançamento' : 'lançamentos'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] text-slate-400 font-black uppercase">Total do Mês</p>
                            <p className="text-sm font-black text-slate-900">
                              R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            {group.paid > 0 && group.paid < group.total && (
                              <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">
                                Pago: R$ {group.paid.toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge className={cn(
                              "border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase",
                              group.status === 'pago' ? "bg-emerald-50 text-emerald-700" :
                              group.status === 'atrasado' ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                            )}>
                              {group.status === 'pago' ? 'Tudo Pago' : group.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                            </Badge>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Detalhamento das Faturas do Mês */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/30">
                          <Table>
                            <TableHeader className="bg-slate-50/50">
                              <TableRow>
                                <TableHead className="font-black text-[9px] uppercase tracking-widest p-4 pl-6">Tipo / Descrição</TableHead>
                                <TableHead className="font-black text-[9px] uppercase tracking-widest p-4">Valor</TableHead>
                                <TableHead className="font-black text-[9px] uppercase tracking-widest p-4">Status</TableHead>
                                <TableHead className="text-right font-black text-[9px] uppercase tracking-widest p-4 pr-6">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.bills.map((bill) => {
                                const contract = tenant?.contracts?.find((c: any) => c.property_id === bill.property_id);
                                const isAtrasado = isBillOverdue(bill, contract?.due_day || 5);

                                return (
                                  <TableRow key={bill.id} className="border-slate-100 hover:bg-white transition-colors">
                                    <TableCell className="p-4 pl-6">
                                      <span className="capitalize block font-bold text-slate-800 text-sm">{bill.type === 'multa_juros' ? 'Multa e Juros' : bill.type}</span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">{getBillDescription(bill)}</span>
                                    </TableCell>
                                    <TableCell className="p-4">
                                      <span className="font-black text-slate-900 text-sm">
                                        R$ {Number(bill.total_value || bill.calculated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </TableCell>
                                    <TableCell className="p-4">
                                      <Badge className={cn(
                                        "border-none px-2.5 py-0.5 rounded-md font-black text-[9px] uppercase", 
                                        bill.status === 'pago' ? "bg-emerald-50 text-emerald-700" : 
                                        isAtrasado ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                                      )}>
                                        {bill.status === 'pago' ? 'Pago' : isAtrasado ? 'Atrasado' : 'Pendente'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="p-4 pr-6 text-right">
                                      <div className="flex justify-end gap-1.5">
                                        {bill.status !== 'pago' ? (
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50" 
                                            onClick={() => handleMarkAsPaid(bill)} 
                                            disabled={processingBillId === bill.id} 
                                            title="Dar Baixa"
                                          >
                                            {processingBillId === bill.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                          </Button>
                                        ) : (
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50" 
                                            onClick={() => handleRevertPayment(bill.id)} 
                                            disabled={processingBillId === bill.id} 
                                            title="Reverter"
                                          >
                                            {processingBillId === bill.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                          </Button>
                                        )}
                                        {!bill.isAutoGenerated && (
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50" 
                                            onClick={() => handleDeleteBill(bill.id)} 
                                            disabled={processingBillId === bill.id} 
                                            title="Excluir"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <CalendarClock className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-bold">Nenhum histórico ou pendência encontrada para o filtro selecionado.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <TenantModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['tenant', id] }); }} tenant={tenant} />
      <BillingSummaryModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} tenantId={id} />
      <ApplyInterestModal 
        isOpen={isInterestModalOpen} 
        onClose={() => setIsInterestModalOpen(false)} 
        tenantId={id || ''} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant-financial-v6', id] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats-v6'] });
          queryClient.invalidateQueries({ queryKey: ['tenants-dashboard-active'] });
        }}
      />
    </DashboardLayout>
  );
};

export default TenantDetails;