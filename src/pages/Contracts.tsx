"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, FileText, Edit2, Trash2, Home, Loader2, AlertCircle } from 'lucide-react';
import { ContractModal } from '@/components/modals/ContractModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Contracts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const queryClient = useQueryClient();

  // Busca Contratos
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

  // Busca Inquilinos para comparar quem está sem contrato
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('tenants').select('id, name').eq('user_id', user?.id);
      return data || [];
    }
  });

  // Filtra inquilinos que não aparecem em nenhum contrato
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
      } catch (error: any) {
        showError('Erro: ' + error.message);
      }
    }
  };

  return (
    <DashboardLayout title="Gestão de Contratos">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-slate-500 font-medium">
            Total de {contracts.length} contratos ativos para {tenants.length} inquilinos.
          </p>
        </div>
        <Button 
          onClick={() => { setSelectedContract(null); setIsModalOpen(true); }} 
          className="h-14 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg w-full md:w-auto"
        >
          <Plus className="w-5 h-5" /> Novo Contrato
        </Button>
      </div>

      {/* Alerta de Inquilinos sem Contrato */}
      {tenantsWithoutContract.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">Inquilinos aguardando contrato</h4>
            <p className="text-xs text-amber-700">
              {tenantsWithoutContract.map(t => t.name).join(', ')} ainda não possuem imóveis vinculados.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsModalOpen(true)}
            className="text-amber-700 font-bold hover:bg-amber-100"
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
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">{c.tenants?.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-1">
                      <Home className="w-3 h-3" />
                      {c.properties?.name}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(c)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(c)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Início</span>
                  <span className="text-slate-900">{new Date(c.start_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Aluguel</span>
                  <span className="text-blue-600">R$ {Number(c.rent_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Badge className={cn(
                  "border-none uppercase text-[10px] font-black px-3 py-1 rounded-lg",
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
          <p className="text-gray-500 mb-6">Crie um contrato para vincular seus inquilinos aos imóveis.</p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600">Criar Contrato</Button>
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

export default Contracts;