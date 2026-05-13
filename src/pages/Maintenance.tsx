"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, Hammer, CheckCircle2, DollarSign, Loader2, Trash2, Edit2 } from 'lucide-react';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Maintenance = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);

  const { data: maintenances = [], isLoading } = useQuery({
    queryKey: ['maintenances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenances')
        .select('*, properties(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const handleCompleteAndPay = async (maintenance: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const now = new Date();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();

      await supabase.from('maintenances').update({ status: 'concluido' }).eq('id', maintenance.id);
      await supabase.from('bills').insert([{
        user_id: user.id,
        property_id: maintenance.property_id,
        type: 'manutencao',
        month,
        year,
        total_value: maintenance.cost || 0,
        status: 'pago',
        description: `Manutenção: ${maintenance.description}`
      }]);

      showSuccess('Manutenção concluída e paga!');
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError('Erro ao processar: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este chamado?')) return;
    try {
      await supabase.from('maintenances').delete().eq('id', id);
      showSuccess('Chamado removido.');
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    } catch (err: any) {
      showError('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <DashboardLayout title="Manutenção">
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-12 px-6 shadow-lg rounded-2xl font-bold" onClick={() => { setSelectedMaintenance(null); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5" /> Novo Chamado
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /><p className="text-gray-400 mt-4 font-medium">Carregando chamados...</p></div>
      ) : maintenances.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {maintenances.map((m) => (
            <Card key={m.id} className={cn("border-none shadow-sm p-6 rounded-[2rem] transition-all", m.status === 'concluido' ? "bg-gray-50/50 opacity-80" : "bg-white")}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn("p-4 rounded-2xl shrink-0", m.status === 'concluido' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{m.status === 'concluido' ? <CheckCircle2 className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-black text-slate-900 tracking-tight truncate">{m.properties?.name || 'Imóvel'}</h3><Badge className={cn("border-none uppercase text-[8px] font-black px-2 py-0.5 rounded-md", m.priority === 'alta' ? 'bg-rose-100 text-rose-700' : m.priority === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>{m.priority}</Badge></div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2">{m.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Custo: R$ {Number(m.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  {m.status !== 'concluido' && (<Button onClick={() => handleCompleteAndPay(m)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold gap-2 h-11 px-5 shadow-lg shadow-emerald-100"><DollarSign className="w-4 h-4" /> Pagar e Concluir</Button>)}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-50 text-blue-600" onClick={() => { setSelectedMaintenance(m); setIsModalOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-50" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center"><div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6"><Hammer className="w-10 h-10" /></div><h3 className="text-xl font-bold text-gray-900 mb-2">Sem manutenções pendentes</h3><p className="text-gray-500 max-w-xs mx-auto mb-8">Registre problemas relatados pelos inquilinos para manter o controle de reparos.</p><Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-2xl h-12 px-8 font-bold border-blue-200 text-blue-600 hover:bg-blue-50">Abrir Novo Chamado</Button></div>
      )}

      <MaintenanceModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['maintenances'] }); }} maintenance={selectedMaintenance} />
    </DashboardLayout>
  );
};

export default Maintenance;