"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Wrench, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ptBR } from 'date-fns/locale';

const events = [
  { date: new Date(2024, 5, 10), title: 'Vencimento Aluguel', type: 'payment', description: 'João Silva • Apto 101', time: '09:00' },
  { date: new Date(2024, 5, 12), title: 'Manutenção Elétrica', type: 'maintenance', description: 'Casa 02 • Reparo fiação', time: '14:30' },
  { date: new Date(2024, 5, 15), title: 'Contrato Vence', type: 'contract', description: 'Maria Oliveira • 30 dias', time: '10:00' },
  { date: new Date(2024, 5, 20), title: 'Vistoria de Saída', type: 'visit', description: 'Kitnet A • Entrega chaves', time: '16:00' },
];

const Calendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2024, 5, 15));

  // Modificadores para destacar os dias no calendário
  const eventDays = {
    payment: events.filter(e => e.type === 'payment').map(e => e.date),
    maintenance: events.filter(e => e.type === 'maintenance').map(e => e.date),
    contract: events.filter(e => e.type === 'contract').map(e => e.date),
    visit: events.filter(e => e.type === 'visit').map(e => e.date),
  };

  return (
    <DashboardLayout title="Calendário de Gestão">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Agenda Imobiliária</h2>
            <p className="text-slate-500 font-medium">Controle de datas, visitas e manutenções</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm">Hoje</Button>
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 text-sm font-black text-slate-900">Junho 2024</span>
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button className="h-12 px-6 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100">
              Novo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            <Card className="premium-card rounded-[2.5rem] border-none p-8">
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="w-full"
                modifiers={eventDays}
                modifiersClassNames={{
                  payment: "bg-emerald-50 text-emerald-700 font-black border-2 border-emerald-200",
                  maintenance: "bg-amber-50 text-amber-700 font-black border-2 border-amber-200",
                  contract: "bg-rose-50 text-rose-700 font-black border-2 border-rose-200",
                  visit: "bg-blue-50 text-blue-700 font-black border-2 border-blue-200",
                }}
                classNames={{
                  root: "w-full",
                  months: "w-full flex flex-col",
                  month: "w-full space-y-8",
                  caption: "hidden",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full justify-between mb-4",
                  head_cell: "text-slate-400 font-bold uppercase text-[10px] tracking-widest w-10 flex justify-center",
                  row: "flex w-full justify-between mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-10 h-10",
                  day: "h-10 w-10 p-0 font-bold text-slate-900 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center",
                  day_selected: "bg-[#2563FF] text-white hover:bg-blue-700 focus:bg-[#2563FF] shadow-lg shadow-blue-100 z-30",
                  day_today: "underline decoration-2 decoration-blue-500 underline-offset-4",
                  day_outside: "text-slate-200 opacity-50",
                  day_disabled: "text-slate-200 opacity-50",
                  day_hidden: "invisible",
                }}
              />
              
              <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contratos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pagamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manutenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vistorias</span>
                </div>
              </div>
            </Card>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-2 mb-2 px-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Eventos do Dia Selecionado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.filter(e => date && e.date.toDateString() === date.toDateString()).length > 0 ? (
                  events.filter(e => date && e.date.toDateString() === date.toDateString()).map((event, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-blue-100 transition-all">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        event.type === 'payment' ? "bg-emerald-50 text-emerald-600" :
                        event.type === 'maintenance' ? "bg-amber-50 text-amber-700" : 
                        event.type === 'contract' ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-600"
                      )}>
                        {event.type === 'payment' ? <DollarSign className="w-5 h-5" /> :
                         event.type === 'maintenance' ? <Wrench className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-black text-slate-900 tracking-tight">{event.title}</p>
                          <span className="text-[10px] font-black text-slate-300">{event.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate font-medium">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-400">Nenhum evento para este dia.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <Card className="premium-card rounded-[2.5rem] border-none h-fit">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center justify-between">
                  Próximos Eventos
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-300">
                    <Bell className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {events.map((event, i) => (
                  <div key={i} className="flex gap-5 group cursor-pointer relative">
                    {i !== events.length - 1 && (
                      <div className="absolute left-[22px] top-12 w-[2px] h-10 bg-slate-50" />
                    )}
                    <div className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm transition-transform group-hover:scale-110",
                      event.type === 'payment' ? "bg-emerald-50 text-emerald-600" :
                      event.type === 'maintenance' ? "bg-amber-50 text-amber-700" : 
                      event.type === 'contract' ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-600"
                    )}>
                      {event.type === 'payment' ? <DollarSign className="w-4 h-4" /> :
                       event.type === 'maintenance' ? <Wrench className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </p>
                        <span className="text-[10px] font-black text-slate-400">
                          {event.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{event.description}</p>
                    </div>
                  </div>
                ))}

                <Button variant="ghost" className="w-full mt-4 text-[#2563FF] font-black text-xs hover:bg-blue-50 rounded-2xl h-12 uppercase tracking-widest">
                  Ver Agenda Completa
                </Button>
              </CardContent>
            </Card>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
              <Clock className="w-8 h-8 mb-6 text-blue-500" />
              <h4 className="text-lg font-black tracking-tight mb-2">Prazos de Hoje</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Você tem <span className="text-white font-black underline decoration-blue-500 decoration-2">3 tarefas pendentes</span> para o período da tarde. Deseja ser notificado no WhatsApp?</p>
              <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-blue-900/50">
                Ativar Alertas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;