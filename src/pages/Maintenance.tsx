"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, Clock, Hammer, Droplets, Zap, Edit2, Trash2 } from 'lucide-react';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const Maintenance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaintenances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('maintenances')
      .select('*, properties(name)')
      .order('created_at', { ascending: false });
    
    if (error) showError('Erro ao carregar manutenções');
    else setMaintenances(data || []);
    setLoading(false);
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

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : maintenances.length > 0 ? (
          maintenances.map((m) => (
            <Card key={m.id} className="border-none shadow-sm p-6 rounded-[2rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Wrench className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{m.properties?.name || 'Imóvel'}</h3>
                    <p className="text-sm text-gray-500">{m.description}</p>
                  </div>
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-none uppercase text-[10px] font-black">{m.status}</Badge>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-20 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed">
            Nenhum chamado de manutenção registrado.
          </div>
        )}
      </div>

      <MaintenanceModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchMaintenances(); }} 
        maintenance={selectedMaintenance} 
      />
    </DashboardLayout>
  );
};

export default Maintenance;