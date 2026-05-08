"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, FileText, Edit2, Trash2, Home } from 'lucide-react';
import { ContractModal } from '@/components/modals/ContractModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Contracts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*, properties(id, name), tenants(id, name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code !== '42P01') console.error('Erro ao carregar contratos:', error);
        setContracts([]);
      } else {
        setContracts(data || []);
      }
    } catch (err) {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleEdit = (contract: any) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleDelete = async (contract: any) => {
    if (window.confirm(`Deseja excluir o contrato de ${contract.tenants?.name}? O imóvel ${contract.properties?.name} voltará a ficar disponível.`)) {
      try {
        // 1. Excluir o contrato
        const { error: deleteError } = await supabase.from('contracts').delete().eq('id', contract.id);
        if (deleteError) throw deleteError;

        // 2. Liberar o imóvel
        if (contract.property_id) {
          await supabase.from('properties').update({ status: 'disponivel' }).eq('id', contract.property_id);
        }

        // 3. Remover vínculo do inquilino
        if (contract.tenant_id) {
          await supabase.from('tenants').update({ property_id: null }).eq('id', contract.tenant_id);
        }

        showSuccess('Contrato removido e imóvel liberado.');
        fetchContracts();
      } catch (error: any) {
        showError('Erro ao excluir contrato: ' + error.message);
      }
    }
  };

  return (
    <DashboardLayout title="Gestão de Contratos">
      <div className="flex justify-end mb-8">
        <Button 
          onClick={() => { setSelectedContract(null); setIsModalOpen(true); }} 
          className="h-14 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Novo Contrato
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Carregando contratos...</div>
      ) : contracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {contracts.map((c) => (
            <Card key={c.id} className="premium-card rounded-[2.5rem] p-8 group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{c.tenants?.name || 'Inquilino'}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Home className="w-3 h-3" />
                      {c.properties?.name || 'Imóvel'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-blue-50 text-blue-600"
                    onClick={() => handleEdit(c)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-500"
                    onClick={() => handleDelete(c)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Início</span>
                  <span className="text-slate-900">{new Date(c.start_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Duração</span>
                  <span className="text-slate-900">{c.duration_months} meses</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <Badge className={cn(
                  "border-none uppercase text-[10px] font-black px-3 py-1 rounded-lg",
                  c.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                )}>
                  {c.status}
                </Badge>
                <p className="font-black text-blue-600 text-lg">
                  R$ {Number(c.rent_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum contrato ativo</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">Vincule inquilinos aos seus imóveis através de contratos formais.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-2xl h-12 px-8 font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
            Gerar Primeiro Contrato
          </Button>
        </div>
      )}
      <ContractModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchContracts(); }} 
        contract={selectedContract}
      />
    </DashboardLayout>
  );
};

export default Contracts;