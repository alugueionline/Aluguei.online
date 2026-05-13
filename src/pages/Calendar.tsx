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
  Droplets,
  CheckCircle2,
  FileText,
  MapPin,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ptBR } from 'date-fns/locale';
import { addMonths, subMonths, format, isSameDay, startOfMonth, endOfMonth, getDate, parseISO, startOfDay } from 'date-fns';
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

      // Buscamos Contratos, Eventos Manuais e Contas do mês
      const [contractsRes, eventsRes, billsRes] = await Promise.all([
        supabase.from('contracts').select('*, properties(name), tenants(name)').eq('status', 'ativo'),
        supabase.from('events').select('*'),
        supabase.from('bills').select('*').eq('month', monthStr).eq('year', yearNum)
      ]);

      // 1. Eventos Manuais (Vistorias, etc)
      const manualEvents = (eventsRes.data || []).map(e => {
        const [y, m, d] = e.date.split('T')[0].split('-').map(Number);
        return {
          ...e,
          date: new Date(y, m - 1, d)
        };
      });

      const contracts = contractsRes.data || [];
      const bills = billsRes.data || [];
      const generatedEvents: any[] = [];
      const lastDayOfMonth = getDate(endOfMonth(currentMonth));

      // 2. Gerar Vencimentos de Aluguel baseados nos CONTRATOS
      contracts.forEach(contract => {
        const dueDay = Math.min(contract.due_day || 5, lastDayOfMonth);
        const eventDate = new Date(yearNum, currentMonth.getMonth(), dueDay);
        
        // Verifica se já existe uma conta de aluguel paga para este contrato/imóvel este mês
        const rentBill = bills.find(b => 
          b.tenant_id === contract.tenant_id && 
          b.property_id === contract.property_id && 
          b.type === 'aluguel'
        );
        
        const isRentPaid = rentBill?.status === 'pago';

        generatedEvents.push({
          id: `contract-rent-${contract.id}-${monthStr}`,
          title: `Aluguel: ${contract.tenants?.name || 'Inquilino'}`,
          description: isRentPaid 
            ? `Pago ✅ (${contract.properties?.name})` 
            : `Vencimento: R$ ${Number(contract.rent_value).toLocaleString('pt-BR')} - ${contract.properties?.name}`,
          type: isRentPaid ? 'paid' : 'payment',
          status: isRentPaid ? 'paid' : 'pending',
          date: eventDate,
          time: '08:00',
          propertyName: contract.properties?.name
        });
      });

      // 3. Gerar Eventos para outras Contas (Energia, Água, etc) que não sejam o aluguel base
      bills.filter(b => b.type !== 'aluguel').forEach(bill => {
        // Usamos o dia de vencimento do contrato vinculado ou dia 5 como fallback
        const contract = contracts.find(c => c.tenant_id === bill.tenant_id && c.property_id === bill.property_id);
        const dueDay = Math.min(contract?.due_day || 5, lastDayOfMonth);
        const eventDate = new Date(yearNum, currentMonth.getMonth(), dueDay);

        generatedEvents.push({
          id: `bill-extra-${bill.id}`,
          title: `${bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}: ${bill.tenants?.name || 'Inquilino'}`,
          description: bill.status === 'pago' 
            ? `Pago ✅` 
            : `Valor: R$ ${Number(bill.total_value || bill.calculated_value).toLocaleString('pt-BR')}`,
          type: 'utility',
          status: bill.status,
          date: eventDate,
          time: '09:00'
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
  
  const selectedDayEvents = events.filter(e => {
    if (!date) return false;
    return isSameDay(startOfDay(e.date), startOfDay(date));
  });

  const eventDays = {
    payment: events.filter(e => e.type === 'payment').map(e => e.date),
    paid: events.filter(e => e.type === 'paid').map(e => e.date),
    utility: events.filter(e => e.type === 'utility' || e.type === 'maintenance').map(e => e.date),
    contract: events.filter(e => e.type === 'contract' || e.type === 'visit').map(e => e.date),
  };
  
  return (
    <DashboardLayout title="Agenda de Gestão">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Calendário Imobiliário</h2>
            <p className="text-slate-500 font-medium">Vencimentos automáticos baseados em seus contratos ativos.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <Button size="icon" variant="ghost" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="px-4 text-sm font-black text-slate-900 min-w-[140px] text-center capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
              <Button size="icon" variant="ghost" onClick={handleNextMonth} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black gap-2 shadow-lg shadow-blue-100">
              <Plus className="w-5 h-5" /> Novo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <Card className="premium-card rounded-[2.5rem] border-none p-8 relative bg-white">
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
                  payment: "bg-orange-500 text-white font-black hover:bg-orange-600 rounded-xl",
                  paid: "bg-emerald-500 text-white font-black hover:bg-emerald-600 rounded-xl",
                  utility: "bg-blue-500 text-white font-black hover:bg-blue-600 rounded-xl",
                  contract: "bg-purple-500 text-white font-black hover:bg-purple-600 rounded-xl",
                }}
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-6",
                  caption: "hidden",
                  table: "w-full border-collapse",
                  head_row: "flex w-full justify-between mb-4",
                  head_cell: "text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] w-12 text-center",
                  row: "flex w-full justify-between mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-12 h-12",
                  day: "h-12 w-12 p-0 font-bold text-slate-900 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer",
                  day_selected: "ring-4 ring-blue-100 bg-blue-600 text-white hover:bg-blue-700 shadow-xl z-30 scale-110",
                  day_today: "border-2 border-blue-500 text-blue-600",
                  day_outside: "text-slate-200 opacity-30",
                }}
              />
              
              <div className="mt-10 flex flex-wrap gap-6 pt-8 border-t border-slate-50">
                <LegendItem color="bg-orange-500" label="Vencimento Pendente" />
                <LegendItem color="bg-emerald-500" label="Recebido / Pago" />
                <LegendItem color="bg-blue-500" label="Contas de Consumo" />
                <LegendItem color="bg-purple-500" label="Contratos / Visitas" />
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Compromissos de {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'hoje'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-blue-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        event.type === 'payment' ? "bg-orange-50 text-orange-600" :
                        event.type === 'paid' ? "bg-emerald-50 text-emerald-600" :
                        event.type === 'utility' ? "bg-blue-50 text-blue-600" : 
                        "bg-purple-50 text-purple-600"
                      )}>
                        {event.type === 'payment' ? <DollarSign className="w-6 h-6" /> :
                         event.type === 'paid' ? <CheckCircle2 className="w-6 h-6" /> :
                         event.type === 'utility' ? <Zap className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-base font-black text-slate-900 tracking-tight">{event.title}</p>
                          <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">{event.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{event.description}</p>
                        {event.propertyName && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-600 uppercase">
                            <Home className="w-3 h-3" /> {event.propertyName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-16 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
                      <CalendarDays className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Nenhum vencimento ou evento para este dia.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h4 className="text-xl font-black tracking-tight mb-4">Visão Inteligente</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                O calendário agora projeta os vencimentos de **cada contrato individualmente**. Se um inquilino tem múltiplos imóveis, você verá todos os vencimentos aqui.
              </p>
            </div>

            <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-blue-50/50 border border-blue-100">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Dica de Gestão</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm text-blue-900/70 font-medium leading-relaxed">
                  Vencimentos em **Laranja** ainda não foram baixados no financeiro. Assim que você der a baixa, eles ficarão **Verdes**.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchEvents(); }} 
        selectedDate={date} 
      />
    </DashboardLayout>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-3">
    <div className={cn("w-4 h-4 rounded-lg shadow-sm", color)} />
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

export default Calendar;