"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  User, 
  FileText, 
  Edit2, 
  Trash2, 
  Home, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  UserPlus
} from 'lucide-react';
import { ContractModal } from '@/components/modals/ContractModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Contracts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const queryClient = useQueryClient();

  // Busca Contratos - Agora usando due_day da própria tabela contracts
  const { data: contracts = [], isLoading: loadingContracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('contracts')
        .select('*, properties(id, name), tenants(id, name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Busca Inquilinos
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('tenants').select('id, name').eq('user_id', user?.id);
      return data || [];
    }
  });

  const activeCount = contracts.filter(c => c.status === 'ativo').length;
  const pendingCount = contracts.filter(c => c.status === 'pendente').length;
  
  const tenantsWithoutContract = tenants.filter(t => 
    !contracts.some(c => c.tenant_id === t.id)
  );

  const handleEdit = (contract: any) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleDelete = async (contract: any) => {
    if (window.confirm(`Excluir contrato de ${contract.tenants?.name}?`)) {
      try {
        await supabase.from('contracts').delete().eq('id', contract.id);
        if (contract.property_id) {
          await supabase.from('properties').update({ status: 'disponivel' }).eq('id', contract.property_id);
        }
        showSuccess('Contrato removido.');
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      } catch (error: any) {
        showError('Erro: ' + error.message);
      }
    }
  };

  return (
    <DashboardLayout title="Gestão de Contratos">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          label="Contratos Ativos" 
          value={activeCount} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          desc="Gerando receita no Dashboard"
        />
        <StatCard 
          label="Aguardando Início" 
          value={pendingCount} 
          icon={<Clock className="text-amber-500" />} 
          desc="Contratos futuros ou pendentes"
        />
        <StatCard 
          label="Inquilinos sem Contrato" 
          value={tenantsWithoutContract.length} 
          icon={<UserPlus className="text-rose-500" />} 
          desc="Precisam de vínculo para o Dashboard"
          highlight={tenantsWithoutContract.length > 0}
        />
      </div>

      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Lista de Contratos</h3>
        <Button 
          onClick={() => { setSelectedContract(null); setIsModalOpen(true); }} 
          className="h-12 px-6 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Novo Contrato
        </Button>
      </div>

      {tenantsWithoutContract.length > 0 && (
        <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-black text-rose-900 tracking-tight">Atenção: Inquilinos sem Contrato</h4>
            <p className="text-sm text-rose-700 font-medium mt-1">
              Os seguintes inquilinos não possuem contrato ativo e **não estão sendo somados no Dashboard**: 
              <span className="font-black ml-1">{tenantsWithoutContract.map(t => t.name).join(', ')}</span>.
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-6 h-11"
          >
            Vincular Agora
          </Button>
        </div>
      )}

      {loadingContracts ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : contracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {contracts.map((c) => (
            <Card key={c.id} className="premium-card rounded-[2.5rem] p-8 group hover:shadow-xl transition-all border-none bg-white">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 leading-tight truncate">{c.tenants?.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-1">
                      <Home className="w-3 h-3" />
                      <span className="truncate">{c.properties?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => handleEdit(c)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(c)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Início</span>
                  <span className="text-slate-900">{new Date(c.start_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Aluguel</span>
                  <span className="text-blue-600 font-black">R$ {Number(c.rent_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Vencimento</span>
                  <span className="text-slate-900">Dia {c.due_day || '5'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Badge className={cn(
                  "border-none uppercase text-[10px] font-black px-3 py-1.5 rounded-lg",
                  c.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                )}>
                  {c.status}
                </Badge>
                <span className="text-[10px] font-bold text-slate-300">ID: #{c.id.slice(0,5)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Nenhum contrato encontrado</h3>
          <p className="text-gray-500 mb-6">Crie um contrato para vincular seus inquilinos aos imóveis e ativar o financeiro.</p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 h-12 px-8 rounded-xl font-bold">Criar Primeiro Contrato</Button>
        </div>
      )}

      <ContractModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['contracts'] }); }} 
        contract={selectedContract}
      />
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon, desc, highlight }: any) => (
  <Card className={cn(
    "premium-card p-6 rounded-[2rem] border-none bg-white transition-all",
    highlight && "ring-2 ring-rose-100 bg-rose-50/30"
  )}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <span className="text-2xl font-black text-slate-900">{value}</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-[10px] text-slate-500 font-medium mt-1">{desc}</p>
  </Card>
);

export default Contracts;