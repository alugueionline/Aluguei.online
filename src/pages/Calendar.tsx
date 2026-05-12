"use client";

import React, { useState, useEffect } from 'react';
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
  Bell,
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ptBR } from 'date-fns/locale';
import { addMonths, subMonths, format, isSameDay, setDate as setDayOfMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { EventModal } from '@/components/modals/EventModal';
import { supabase } from '@/integrations/supabase/client';

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar eventos manuais
      const { data: manualEvents } = await supabase.from('events').select('*');
      
      // 2. Buscar CONTRATOS ativos para gerar vencimentos individuais
      const { data: contracts } = await supabase
        .from('contracts')
        .select('*, tenants(name), properties(name)')
        .eq('status', 'ativo');

      const formattedManual = (manualEvents || []).map(e => ({
        ...e,
        date: new Date(e.date)
      }));

      // 3. Gerar eventos de vencimento baseados no contrato
      const rentEvents: any[] = [];
      if (contracts) {
        contracts.forEach(c => {
          // Prioriza o due_day do contrato, se não houver, usa o do inquilino (fallback)
          const dueDay = c.due_day || 5;
          
          const eventDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dueDay);
          
          rentEvents.push({
            id: `rent-${c.id}`,
            title: `Aluguel: ${c.tenants?.name || 'Inquilino'}`,
            description: `Vencimento aluguel ${c.properties?.name || 'Imóvel'}`,
            type: 'payment',
            date: eventDate,
            time: '08:00'
          });
        });
      }

      setEvents([...formattedManual, ...rentEvents]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setDate(today);
  };

  const eventDays = {
    payment: events.filter(e => e.type === 'payment').map(e => e.date),
    maintenance: events.filter(e => e.type === 'maintenance').map(e => e.date),
    contract: events.filter(e => e.type === 'contract').map(e => e.date),
    visit: events.filter(e => e.type === 'visit').map(e => e.date),
  };

  const selectedDayEvents = events.filter(e => date && isSameDay(e.date, date));
  const upcomingEvents = [...events]
    .filter(e => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <DashboardLayout title="Agenda de Gestão">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Calendário Imobiliário</h2>
            <p className="text-slate-500 font-medium">Visualize compromissos e prazos importantes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleToday} className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm">Hoje</Button>
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <Button size="icon" variant="ghost" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="px-4 text-sm font-black text-slate-900 min-w-[140px] text-center capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
              <Button size="icon" variant="ghost" onClick={handleNextMonth} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-100">
              <Plus className="w-5 h-5" /> Novo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <Card className="premium-card rounded-[2.5rem] border-none p-8">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
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
                    payment: "bg-emerald-100 text-emerald-700 font-black",
                    maintenance: "bg-amber-100 text-amber-700 font-black",
                    contract: "bg-rose-100 text-rose-700 font-black",
                    visit: "bg-blue-100 text-blue-700 font-black",
                  }}
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-4",
                    caption: "hidden",
                    table: "w-full border-collapse",
                    head_row: "flex w-full justify-between",
                    head_cell: "text-slate-400 font-bold uppercase text-[10px] tracking-widest w-12 text-center",
                    row: "flex w-full justify-between mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-12 h-12",
                    day: "h-12 w-12 p-0 font-bold text-slate-900 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center",
                    day_selected: "bg-[#2563FF] text-white hover:bg-blue-700 focus:bg-[#2563FF] shadow-lg shadow-blue-100",
                    day_today: "border-2 border-blue-500 text-blue-600",
                    day_outside: "text-slate-300 opacity-50",
                  }}
                />
              )}
              
              <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-slate-50">
                <LegendItem color="bg-emerald-400" label="Vencimentos / Pagamentos" />
                <LegendItem color="bg-amber-400" label="Manutenção" />
                <LegendItem color="bg-rose-400" label="Contratos" />
                <LegendItem color="bg-blue-400" label="Vistorias" />
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Eventos de {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'hoje'}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={event.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all">
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
                  <div className="col-span-2 p-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-400">Nenhum compromisso agendado para este dia.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <Card className="premium-card rounded-[2.5rem] border-none p-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Próximos Vencimentos
              </h3>
              <div className="space-y-6">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
                  <div key={event.id} className="flex gap-4 items-center group cursor-pointer">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                      event.type === 'payment' ? "bg-emerald-50 text-emerald-600" :
                      event.type === 'maintenance' ? "bg-amber-50 text-amber-700" : 
                      event.type === 'contract' ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-600"
                    )}>
                      {event.type === 'payment' ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{event.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{format(event.date, 'dd MMM', { locale: ptBR })} • {event.time}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 font-medium">Nenhum evento futuro.</p>
                )}
              </div>
            </Card>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h4 className="text-lg font-black tracking-tight mb-4">Dica de Gestão</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Os vencimentos de aluguel agora são baseados em cada contrato individual. Se um inquilino tem dois imóveis, você verá duas datas de vencimento.
              </p>
            </div>
          </div>
        </div>
      </div>
      <EventModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchEvents(); }} selectedDate={date} />
    </DashboardLayout>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={cn("w-3 h-3 rounded-full", color)} />
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

export default Calendar;