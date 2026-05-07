"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Wrench, UserPlus } from 'lucide-react';

const events = [
  { date: new Date(2024, 5, 10), title: 'Vencimento Aluguel', type: 'payment', tenant: 'João Silva' },
  { date: new Date(2024, 5, 12), title: 'Manutenção Elétrica', type: 'maintenance', property: 'Casa 02' },
  { date: new Date(2024, 5, 15), title: 'Vencimento Aluguel', type: 'payment', tenant: 'Maria Oliveira' },
  { date: new Date(2024, 5, 20), title: 'Vistoria de Saída', type: 'visit', property: 'Kitnet A' },
];

const Calendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <DashboardLayout title="Calendário de Gestão">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white p-6 rounded-3xl">
          <CalendarUI
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-none w-full flex justify-center"
            classNames={{
              day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600",
              day_today: "bg-blue-50 text-blue-600 font-bold",
            }}
          />
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Eventos do Mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className={cn(
                    "p-2.5 rounded-xl shrink-0",
                    event.type === 'payment' ? "bg-emerald-50 text-emerald-600" :
                    event.type === 'maintenance' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {event.type === 'payment' ? <DollarSign className="w-4 h-4" /> :
                     event.type === 'maintenance' ? <Wrench className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {event.tenant || event.property} • {event.date.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-600 text-white rounded-3xl p-6">
            <Clock className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="text-lg font-bold mb-1">Lembrete</h4>
            <p className="text-sm text-blue-100">Você tem 3 aluguéis vencendo nos próximos 5 dias. Verifique as confirmações.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

import { cn } from '@/lib/utils';
export default Calendar;