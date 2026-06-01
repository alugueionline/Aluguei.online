"use client";

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Clock, Wrench, FileWarning, Loader2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isBillOverdue } from '@/utils/financial';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';

const Alerts = () => {
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['real-time-notifications'],
    queryFn: async () => {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();
      const today = new Date();

      const [billsRes, contractsRes, maintenanceRes] = await Promise.all([
        supabase.from('bills').select('*, tenants(name), properties(name)').neq('status', 'pago'),
        supabase.from('contracts').select('*, tenants(name), properties(name)').eq('status', 'ativo'),
        supabase.from('maintenances').select('*, properties(name)').eq('status', 'pendente')
      ]);

      const alerts: any[] = [];

      // 1. Aluguéis Atrasados (Erro)
      billsRes.data?.forEach(bill => {
        const contract = contractsRes.data?.find(c => c.tenant_id === bill.tenant_id && c.property_id === bill.property_id);
        if (isBillOverdue(bill, contract?.due_day || 5)) {
          alerts.push({
            id: `overdue-${bill.id}`,
            title: 'Pagamento Atrasado',
            desc: `${bill.tenants?.name} (${bill.properties?.name}) está com o ${bill.type} de ${bill.month}/${bill.year} atrasado.`,
            type: 'error',
            icon: AlertCircle,
            path: `/tenants/${bill.tenant_id}`
          });
        }
      });

      // 2. Vencimentos Próximos (Aviso) - Próximos 3 dias
      contractsRes.data?.forEach(contract => {
        const dueDay = contract.due_day || 5;
        const dueDate = new Date(currentYear, today.getMonth(), dueDay);
        const daysDiff = differenceInDays(dueDate, today);

        if (daysDiff >= 0 && daysDiff <= 3) {
          const hasPaid = billsRes.data?.some(b => 
            b.tenant_id === contract.tenant_id && 
            b.property_id === contract.property_id && 
            b.type === 'aluguel' && 
            b.month === currentMonth && 
            b.year === currentYear
          ) === false;

          if (hasPaid) {
            alerts.push({
              id: `due-soon-${contract.id}`,
              title: 'Vencimento Próximo',
              desc: `O aluguel de ${contract.tenants?.name} vence em ${daysDiff === 0 ? 'HOJE' : `${daysDiff} dias`}.`,
              type: 'warning',
              icon: Clock,
              path: `/tenants/${contract.tenant_id}`
            });
          }
        }
      });

      // 3. Manutenções Pendentes (Info)
      maintenanceRes.data?.forEach(m => {
        alerts.push({
          id: `maint-${m.id}`,
          title: 'Manutenção Pendente',
          desc: `Chamado aberto para ${m.properties?.name}: ${m.description}`,
          type: 'info',
          icon: Wrench,
          path: '/maintenance'
        });
      });

      // 4. Contratos Terminando (Aviso) - Próximos 30 dias
      contractsRes.data?.forEach(c => {
        if (c.contract_end_date) {
          const endDate = parseISO(c.contract_end_date);
          const daysTo运维 = differenceInDays(endDate, today);
          if (daysTo运维 >= 0 && daysTo运维 <= 30) {
            alerts.push({
              id: `end-contract-${c.id}`,
              title: 'Contrato a Vencer',
              desc: `O contrato de ${c.tenants?.name} encerra em ${daysTo运维} dias.`,
              type: 'warning',
              icon: FileWarning,
              path: `/contracts`
            });
          }
        }
      });

      return alerts;
    }
  });

  return (
    <DashboardLayout title="Avisos e Notificações">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">O que precisa de atenção</h2>
        <p className="text-slate-500 font-medium">Monitoramento em tempo real da sua carteira.</p>
      </div>

      {isLoading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sincronizando alertas...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4 max-w-4xl">
          {notifications.map((alert) => (
            <Card 
              key={alert.id} 
              className={cn(
                "border-none shadow-sm hover:shadow-md transition-all group cursor-pointer",
                alert.type === 'error' ? "bg-rose-50/50 border-l-4 border-l-rose-500" :
                alert.type === 'warning' ? "bg-amber-50/50 border-l-4 border-l-amber-500" :
                "bg-blue-50/50 border-l-4 border-l-blue-500"
              )}
              onClick={() => navigate(alert.path)}
            >
              <CardContent className="p-6 flex items-start gap-5">
                <div className={cn(
                  "p-3 rounded-2xl shrink-0 shadow-sm",
                  alert.type === 'error' ? "bg-rose-100 text-rose-600" :
                  alert.type === 'warning' ? "bg-amber-100 text-amber-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  <alert.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg tracking-tight">
                        {alert.title}
                      </h3>
                      <p className="text-slate-600 font-medium mt-1 leading-relaxed">{alert.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Resolver Agora <Home className="w-3 h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
            <Bell className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Tudo sob controle!</h3>
          <p className="text-slate-400 font-medium mt-2">Não existem pendências ou atrasos no momento.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Alerts;