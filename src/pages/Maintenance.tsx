"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, Hammer } from 'lucide-react';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Maintenance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenances')
        .select('*, properties(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code !== '42P01') console.error('Erro ao carregar manutenções:', error);
        setMaintenances([]);
      } else {
        setMaintenances(data || []);
      }
    } catch (err) {
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  return (
    <DashboardLayout title="Manutenção">
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-12 px-6 shadow-lg" onClick={() => { setSelectedMaintenance(null); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5" /> Novo Chamado
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Carregando chamados...</div>
      ) : maintenances.length > 0 ? (
        <div className="space-y-4">
          {maintenances.map((m) => (
            <Card key={m.id} className="border-none shadow-sm p-6 rounded-[2rem] bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{m.properties?.name || 'Imóvel'}</h3>
                    <p className="text-sm text-gray-500">{m.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn(
                    "border-none uppercase text-[10px] font-black px-3 py-1 rounded-lg",
                    m.status === 'concluido' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  )}>
                    {m.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
            <Hammer className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sem manutenções pendentes</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">Registre problemas relatados pelos inquilinos para manter o controle de reparos.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-2xl h-12 px-8 font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
            Abrir Novo Chamado
          </Button>
        </div>
      )}

      <MaintenanceModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchMaintenances(); }} 
        maintenance={selectedMaintenance} 
      />
    </DashboardLayout>
  );
};

export default Maintenance;