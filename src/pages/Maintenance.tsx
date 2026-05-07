import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Hammer,
  Droplets,
  Zap,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';

const mockMaintenances = [
  { id: '1', propertyName: 'Apto 101', description: 'Vazamento na pia da cozinha', category: 'hidraulica', status: 'pendente', priority: 'alta', date: '2024-06-10', cost: 150 },
  { id: '2', propertyName: 'Casa 02', description: 'Troca de fiação do chuveiro', category: 'eletrica', status: 'em_andamento', priority: 'media', date: '2024-06-12', cost: 300 },
  { id: '3', propertyName: 'Kitnet A', description: 'Pintura da fachada', category: 'pintura', status: 'concluido', priority: 'baixa', date: '2024-05-20', cost: 1200 },
];

const Maintenance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hidraulica': return <Droplets className="w-4 h-4" />;
      case 'eletrica': return <Zap className="w-4 h-4" />;
      case 'pintura': return <Hammer className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido': return <Badge className="bg-green-50 text-green-700 border-none">Concluído</Badge>;
      case 'em_andamento': return <Badge className="bg-blue-50 text-blue-700 border-none">Em Andamento</Badge>;
      default: return <Badge className="bg-orange-50 text-orange-700 border-none">Pendente</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-rose-600';
      case 'media': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <DashboardLayout title="Manutenção">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pendentes</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">2 Chamados</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Em Execução</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">1 Ativo</h3>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-12 px-6 shadow-lg w-full sm:w-auto" onClick={() => { setSelectedMaintenance(null); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5" /> Novo Chamado
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockMaintenances.map((m) => (
          <Card key={m.id} className="border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    m.category === 'hidraulica' ? 'bg-blue-50 text-blue-600' : 
                    m.category === 'eletrica' ? 'bg-orange-50 text-orange-600' : 
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {getCategoryIcon(m.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{m.propertyName}</h3>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(m.priority)}`}>
                        {m.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{m.description}</p>
                    <div className="flex items-center gap-4 text-[10px] md:text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(m.date).toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-1 font-bold text-gray-700">R$ {m.cost?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-4 md:pt-0">
                  {getStatusBadge(m.status)}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600" onClick={() => { setSelectedMaintenance(m); setIsModalOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MaintenanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maintenance={selectedMaintenance} 
      />
    </DashboardLayout>
  );
};

export default Maintenance;