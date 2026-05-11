"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Home,
  CreditCard,
  History,
  ShieldCheck,
  Clock,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Edit2,
  Building2,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  Wallet
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
import { showSuccess, showError } from '@/utils/toast';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [processingBillId, setProcessingBillId] = useState<string | null>(null);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          contracts (
            id,
            rent_value,
            status,
            properties (
              id,
              name,
              address,
              base_rent,
              image_url,
              type
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: financialData } = useQuery({
    queryKey: ['tenant-financial', id],
    queryFn: async () => {
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('tenant_id', id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      const history = bills || [];
      
      // Cálculo da Dívida Total (Pendente + Atrasado)
      const totalDebt = history
        .filter(b => b.status !== 'pago')
        .reduce((acc, curr) => acc + Number(curr.total_value || curr.calculated_value), 0);

      // Cálculo do Total Pago (Histórico Completo)
      const totalPaid = history
        .filter(b => b.status === 'pago')
        .reduce((acc, curr) => acc + Number(curr.total_value || curr.calculated_value), 0);

      const pendingCount = history.filter(b => b.status === 'pendente').length;
      const overdueCount = history.filter(b => b.status === 'atrasado').length;

      return { history, totalDebt, totalPaid, pendingCount, overdueCount };
    },
    enabled: !!tenant
  });

  const revertPaymentMutation = useMutation({
    mutationFn: async (billId: string) => {
      setProcessingBillId(billId);
      const { error } = await supabase
        .from('bills')
        .update({ status: 'pendente', payment_date: null })
        .eq('id', billId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-financial', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showSuccess("Pagamento revertido para pendente.");
    },
    onError: (error: any) => {
      showError("Erro ao reverter: " + error.message);
    },
    onSettled: () => {
      setProcessingBillId(null);
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Carregando perfil do inquilino...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!tenant) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Inquilino não encontrado</h2>
          <Button onClick={() => navigate('/tenants')} className="mt-4">Voltar para Lista</Button>
        </div>
      </DashboardLayout>
    );
  }

  const activeContracts = tenant.contracts?.filter((c: any) => c.status === 'ativo') || [];

  return (
    <DashboardLayout title="Perfil do Inquilino">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          className="gap-2 text-gray-500 hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsBillingModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold gap-2 shadow-lg shadow-emerald-100"
          >
            <MessageSquare className="w-4 h-4" /> Cobrar WhatsApp
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2"
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
              <div className="absolute -top-12 left-6">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-12 h-12" />
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                <Badge className="mt-2 bg-green-50 text-green-700 border-none uppercase text-[10px] font-black">
                  {tenant.status}
                </Badge>
              </div>
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold">{tenant.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold">{tenant.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold">CPF: {tenant.cpf || 'Não informado'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className={cn(
              "border-none shadow-sm rounded-[2rem]",
              financialData?.totalDebt && financialData.totalDebt > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className={cn(
                  "text-sm font-black flex items-center gap-2 uppercase tracking-widest",
                  financialData?.totalDebt && financialData.totalDebt > 0 ? "text-rose-800" : "text-emerald-800"
                )}>
                  {financialData?.totalDebt && financialData.totalDebt > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  Dívida Total Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-2xl font-black",
                  financialData?.totalDebt && financialData.totalDebt > 0 ? "text-rose-900" : "text-emerald-900"
                )}>
                  R$ {financialData?.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-blue-50 border-blue-100 rounded-[2rem]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-blue-800 flex items-center gap-2 uppercase tracking-widest">
                  <Wallet className="w-4 h-4" />
                  Total Pago (Acumulado)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black text-blue-900">
                  R$ {financialData?.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-blue-400 font-bold uppercase mt-1">Desde o início do contrato</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Imóveis Locados ({activeContracts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContracts.length > 0 ? activeContracts.map((contract: any) => (
                <Card key={contract.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
                  <CardContent className="p-0">
                    <div className="h-24 bg-slate-100 relative">
                      {contract.properties?.image_url ? (
                        <img src={contract.properties.image_url} alt={contract.properties.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Home className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 truncate">{contract.properties?.name}</h4>
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-blue-100 text-blue-600">
                          {contract.properties?.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Aluguel</p>
                          <p className="text-sm font-black text-blue-600">R$ {Number(contract.rent_value).toLocaleString('pt-BR')}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600"
                          onClick={() => navigate(`/properties/${contract.properties?.id}`)}
                        >
                          Ver Imóvel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-2 p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Nenhum imóvel vinculado no momento.</p>
                </div>
              )}
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                <History className="w-5 h-5 text-blue-600" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {financialData?.history && financialData.history.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Referência</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Tipo</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Valor</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Status</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase tracking-widest p-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.history.map((bill) => (
                      <TableRow key={bill.id} className="border-slate-50">
                        <TableCell className="p-6 font-bold text-slate-900">{bill.month}/{bill.year}</TableCell>
                        <TableCell className="p-6 capitalize text-slate-500 font-medium">{bill.type}</TableCell>
                        <TableCell className="p-6 font-black text-slate-900">R$ {Number(bill.total_value || bill.calculated_value).toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="p-6">
                          <Badge className={cn(
                            "border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase",
                            bill.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          )}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-6 text-right">
                          {bill.status === 'pago' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => revertPaymentMutation.mutate(bill.id)}
                              disabled={processingBillId === bill.id}
                              title="Reverter para Pendente"
                            >
                              {processingBillId === bill.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                    <History className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-medium">Nenhum pagamento registrado no histórico.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <TenantModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['tenant', id] }); }} 
        tenant={tenant} 
      />

      <BillingSummaryModal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
        tenantId={id}
      />
    </DashboardLayout>
  );
};

export default TenantDetails;