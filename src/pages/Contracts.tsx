"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, FileText, FileWarning } from 'lucide-react';
import { ContractModal } from '@/components/modals/ContractModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const Contracts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*, properties(name), tenants(name)')
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

  return (
    <DashboardLayout title="Gestão de Contratos">
      <div className="flex justify-end mb-8">
        <Button onClick={() => setIsModalOpen(true)} className="h-14 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> Novo Contrato
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Carregando contratos...</div>
      ) : contracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {contracts.map((c) => (
            <Card key={c.id} className="premium-card rounded-[2.5rem] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{c.tenants?.name || 'Inquilino'}</h3>
                  <p className="text-xs text-slate-400 font-bold">{c.properties?.name || 'Imóvel'}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <Badge className="bg-emerald-50 text-emerald-700 border-none uppercase text-[10px] font-black">{c.status}</Badge>
                <p className="font-black text-blue-600">R$ {Number(c.rent_value).toLocaleString('pt-BR')}</p>
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
      <ContractModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchContracts(); }} />
    </DashboardLayout>
  );
};

export default Contracts;