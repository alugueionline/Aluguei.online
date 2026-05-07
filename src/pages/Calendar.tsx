"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
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
import { addMonths, subMonths, format } from 'date-fns';
import { EventModal } from '@/components/modals/EventModal';
import { showSuccess } from '@/utils/toast';

const initialEvents = [
  { id: '1', date: new Date(2024, 5, 10), title: 'Vencimento Aluguel', type: 'payment', description: 'João Silva • Apto 101', time: '09:00' },
  { id: '2', date: new Date(2024, 5, 12), title: 'Manutenção Elétrica', type: 'maintenance', description: 'Casa 02 • Reparo fiação', time: '14:30' },
  { id: '3', date: new Date(2024, 5, 15), title: 'Contrato Vence', type: 'contract', description: 'Maria Oliveira • 30 dias', time: '10:00' },
  { id: '4', date: new Date(2024, 5, 20), title: 'Vistoria de Saída', type: 'visit', description: 'Kitnet A • Entrega chaves', time: '16:00' },
];

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState(initialEvents);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setDate(today);
  };

  const handleAddEvent = (newEvent: any) => {
    // Simulação de adição de evento
    const event = {
      id: Math.random().toString(),
      date: new Date(newEvent.date),
      title: newEvent.title,
      type: newEvent.type,
      description: 'Novo evento agendado',
      time: newEvent.time
    };
    setEvents([...events, event]);
    showSuccess('Evento adicionado com sucesso!');
  };

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
            <Button variant="outline" onClick={handleToday} className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm">Hoje</Button>
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <Button size="icon" variant="ghost" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="px-4 text-sm font-black text-slate-900 min-w-[120px] text-center capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
              <Button size="icon" variant="ghost" onClick={handleNextMonth} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100">Novo Evento</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            <Card className="premium-card rounded-[2.5rem] border-none p-8">
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={setDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={ptBR}
                className="w-full"
                modifiers={eventDays}
                modifiersClassNames={{
                  payment: "bg-emerald-50 text-emerald-700 font-black border-2 border-emerald-200",
                  maintenance: "bg-amber-50 text-amber-700 font-black border-2 border-amber-200",
                  contract: "bg-rose-50 text-rose-700 font-black border-2 border-rose-200",
                  visit: "bg-blue-50 text-blue-700 font-black border-2 border-blue-200",
                }}
              />
            </Card>
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-2 mb-2 px-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Eventos do Dia Selecionado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.filter(e => date && e.date.toDateString() === date.toDateString()).map((event, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-blue-100 transition-all">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", event.type === 'payment' ? "bg-emerald-50 text-emerald-600" : event.type === 'maintenance' ? "bg-amber-50 text-amber-700" : event.type === 'contract' ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-600")}>
                      {event.type === 'payment' ? <DollarSign className="w-5 h-5" /> : event.type === 'maintenance' ? <Wrench className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{event.title}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate font-medium">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 space-y-8">
            <Card className="premium-card rounded-[2.5rem] border-none h-fit p-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Próximos Eventos</h3>
              <div className="space-y-6">
                {events.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", event.type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>
                      {event.type === 'payment' ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{event.title}</p>
                      <p className="text-[10px] text-slate-400">{format(event.date, 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedDate={date} />
    </DashboardLayout>
  );
};

export default Calendar;