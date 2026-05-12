"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { 
  Clock, 
  DollarSign, 
  Wrench, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays,
  Bell,
  Plus,
  Loader2,
  Zap,
  Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ptBR } from 'date-fns/locale';
import { addMonths, subMonths, format, isSameDay, startOfMonth, endOfMonth, getDate, parseISO } from 'date-fns';
import { EventModal } from '@/components/modals/EventModal';
import { supabase } from '@/integrations/supabase/client';

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      const monthStr = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
      const yearNum = currentMonth.getFullYear();

      // Buscamos Inquilinos (para o dia de vencimento), Eventos Manuais e Contas do mês
      const [tenantsRes, eventsRes, billsRes] = await Promise.all([
        supabase.from('tenants').select('*, properties(name)').eq('status', 'ativo'),
        supabase.from('events').select('*'),
        supabase.from('bills').select('*').eq('month', monthStr).eq('year', yearNum)
      ]);

      const manualEvents = (eventsRes.data || []).map(e => ({
        ...e,
        date: parseISO(e.date.split('T')[0]) // Garante que a data seja tratada sem timezone shift
      }));

      const tenants = tenantsRes.data || [];
      const bills = billsRes.data || [];

      const generatedEvents: any[] = [];
      const lastDayOfMonth = getDate(endOfMonth(currentMonth));

      tenants.forEach(tenant => {
        // O Dia do Vencimento vem do cadastro do Inquilino
        const dueDay = Math.min(tenant.due_day || 5, lastDayOfMonth);
        const eventDate = new Date(yearNum, currentMonth.getMonth(), dueDay);
        
        // 1. Evento de Aluguel
        const rentBill = bills.find(b => b.tenant_id === tenant.id && b.type === 'aluguel');
        const isRentPaid = rentBill?.status === 'pago';

        generatedEvents.push({
          id: `rent-${tenant.id}-${monthStr}`,
          title: `Aluguel: ${tenant.name}`,
          description: isRentPaid ? 'Pagamento Confirmado ✅' : `Vencimento do aluguel - ${tenant.properties?.name || 'Imóvel'}`,
          type: 'payment',
          status: isRentPaid ? 'paid' : 'pending',
          date: eventDate,
          time: '08:00'
        });

        // 2. Outras Contas (Energia, Água, etc.) vinculadas a este inquilino no mês
        const otherBills = bills.filter(b => b.tenant_id === tenant.id && b.type !== 'aluguel');
        otherBills.forEach(bill => {
          generatedEvents.push({
            id: `bill-${bill.id}`,
            title: `${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}: ${tenant.name}`,
            description: bill.status === 'pago' ? 'Pago ✅' : `Valor: R$ ${Number(bill.total_value).toLocaleString('pt-BR')}`,
            type: bill.type === 'energia' ? 'maintenance' : 'visit', // Usamos tipos existentes para cores
            status: bill.status,
            date: eventDate,
            time: '09:00'
          });
        });
      });

      setEvents([...manualEvents, ...generatedEvents]);
    } catch (err) {
      console.error("Erro ao carregar agenda:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrevMonth = () => setCurrentMonth(prev => startOfMonth(subMonths(prev, 1)));
  const handleNextMonth = () => setCurrentMonth(prev => startOfMonth(addMonths(prev, 1)));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setDate(today);
  };

  const eventDays = {
    payment: events.filter(e => e.type === 'payment' && e.status !== 'paid').map(e => e.date),
    paid: events.filter(e => e.type === 'payment' && e.status === 'paid').map(e => e.date),
    maintenance: events.filter(e => e.type === 'maintenance' || e.type === 'energia').map(e => e.date),
    contract: events.filter(e => e.type === 'contract').map(e => e.date),
    visit: events.filter(e => e.type === 'visit' || e.type === 'agua').map(e => e.date),
  };

  const selectedDayEvents = events.filter(e => date && isSameDay(e.date, date));
  
  return (
    <DashboardLayout title="Agenda de Gestão">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Calendário Imobiliário</h2>
            <p className="text-slate-500 font-medium">Visualize todos os vencimentos baseados no dia acordado com o inquilino.</p>
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
            <Card className="premium-card rounded-[2.5rem] border-none p-8 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[2.5rem]">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
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
                  payment: "bg-amber-100 text-amber-700 font-black",
                  paid: "bg-emerald-100 text-emerald-700 font-black",
                  maintenance: "bg-blue-100 text-blue-700 font-black",
                  contract: "bg-rose-100 text-rose-700 font-black",
                  visit: "bg-slate-100 text-slate-700 font-black",
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
              
              <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-slate-50">
                <LegendItem color="bg-amber-400" label="Vencimento Pendente" />
                <LegendItem color="bg-emerald-400" label="Pagamento Confirmado" />
                <LegendItem color="bg-blue-400" label="Contas de Consumo" />
                <LegendItem color="bg-rose-400" label="Contratos/Vistorias" />
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compromissos de {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'hoje'}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={event.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        event.type === 'payment' ? (event.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600") :
                        event.type === 'maintenance' || event.type === 'energia' ? "bg-blue-50 text-blue-600" : 
                        event.type === 'contract' ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"
                      )}>
                        {event.type === 'payment' ? <DollarSign className="w-5 h-5" /> :
                         event.type === 'energia' ? <Zap className="w-5 h-5" /> :
                         event.type === 'agua' ? <Droplets className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
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
                    <p className="text-sm font-bold text-slate-400">Nenhum vencimento ou evento para este dia.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h4 className="text-lg font-black tracking-tight mb-4">Visão de Vencimentos</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                O calendário projeta automaticamente os vencimentos de aluguel e contas de consumo no dia acordado com cada inquilino.
              </p>
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Legenda de Status</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Aguardando Pagamento</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Recebido / Confirmado</span>
                  </div>
                </div>
              </div>
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