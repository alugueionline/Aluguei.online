"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const initialAlerts = [
  { id: '1', title: 'Pagamento Atrasado', desc: 'Pedro Santos (Kitnet A) está com 5 dias de atraso no aluguel.', type: 'error', time: 'Há 2 horas', read: false },
  { id: '2', title: 'Contrato a Vencer', desc: 'O contrato de João Silva (Apto 101) vence em 30 dias.', type: 'warning', time: 'Há 5 horas', read: false },
  { id: '3', title: 'Manutenção Concluída', desc: 'A troca de fiação na Casa 02 foi finalizada pelo prestador.', type: 'success', time: 'Ontem', read: true },
  { id: '4', title: 'Novo Chamado', desc: 'Vazamento relatado no Apto 202 por Ana Costa.', type: 'info', time: 'Ontem', read: true },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    showSuccess('Notificação removida.');
  };

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
    showSuccess('Todas as notificações marcadas como lidas.');
  };

  return (
    <DashboardLayout title="Avisos e Notificações">
      <div className="flex justify-between items-center mb-8">
        <p className="text-gray-500">Você tem {alerts.filter(a => !a.read).length} notificações não lidas.</p>
        <Button 
          variant="ghost" 
          onClick={markAllRead}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
        >
          Marcar todas como lidas
        </Button>
      </div>

      <div className="space-y-4 max-w-4xl">
        {alerts.map((alert) => (
          <Card key={alert.id} className={cn(
            "border-none shadow-sm transition-all group",
            !alert.read ? "bg-white border-l-4 border-l-blue-600" : "bg-gray-50/50"
          )}>
            <CardContent className="p-6 flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-2xl shrink-0",
                alert.type === 'error' ? "bg-red-50 text-red-600" :
                alert.type === 'warning' ? "bg-orange-50 text-orange-600" :
                alert.type === 'success' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
              )}>
                {alert.type === 'error' ? <AlertCircle className="w-6 h-6" /> :
                 alert.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("font-bold text-gray-900", !alert.read && "text-blue-900")}>
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium shrink-0">{alert.time}</span>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(alert.id)} className="h-8 px-3 text-gray-400 hover:text-red-600 gap-2">
                    <Trash2 className="w-4 h-4" /> Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhuma notificação por aqui.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;