"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Clock, CheckCircle2, Trash2, MoreVertical } from 'lucide-react';

const alerts = [
  { id: '1', title: 'Pagamento Atrasado', desc: 'Pedro Santos (Kitnet A) está com 5 dias de atraso no aluguel.', type: 'error', time: 'Há 2 horas', read: false },
  { id: '2', title: 'Contrato a Vencer', desc: 'O contrato de João Silva (Apto 101) vence em 30 dias.', type: 'warning', time: 'Há 5 horas', read: false },
  { id: '3', title: 'Manutenção Concluída', desc: 'A troca de fiação na Casa 02 foi finalizada pelo prestador.', type: 'success', time: 'Ontem', read: true },
  { id: '4', title: 'Novo Chamado', desc: 'Vazamento relatado no Apto 202 por Ana Costa.', type: 'info', time: 'Ontem', read: true },
];

const Alerts = () => {
  return (
    <DashboardLayout title="Avisos e Notificações">
      <div className="flex justify-between items-center mb-8">
        <p className="text-gray-500">Você tem 2 notificações não lidas.</p>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
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
                  {!alert.read && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 px-4 text-xs">
                      Ver Detalhes
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-400 hover:text-red-600 gap-2">
                    <Trash2 className="w-4 h-4" /> Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

import { cn } from '@/lib/utils';
export default Alerts;