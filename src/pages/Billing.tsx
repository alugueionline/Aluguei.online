"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Zap, Droplets, Percent, FileText, Edit2, Trash2, CheckCircle2, Clock, DollarSign, Loader2, Users } from 'lucide-react';
import { BillingModal } from '@/components/modals/BillingModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Billing = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*, properties(name), tenants(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const handleEdit = (bill: any) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este lançamento?')) return;
    try {
      await supabase.from('bills').delete().eq('id', id);
      showSuccess('Lançamento removido.');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    } catch (err: any) {
      showError('Erro ao excluir: ' + err.message);
    }
  };

  const filteredBills = bills.filter(bill => 
    (bill.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.tenants?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendente = bills.filter(b => b.status !== 'pago').reduce((acc, b) => acc + Number(b.total_value || b.calculated_value), 0);
  const totalPago = bills.filter(b => b.status === 'pago').reduce((acc, b) => acc + Number(b.total_value || b.calculated_value), 0);

  return (
    <DashboardLayout title="Contas e Utilidades">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card className="border-none shadow-sm bg-white rounded-[2rem]"><CardContent className="p-6 flex items-center gap-4"><div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Clock className="w-6 h-6" /></div><div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Pendente</p><h3 className="text-xl md:text-2xl font-black text-gray-900">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3></div></CardContent></Card>
        <Card className="border-none shadow-sm bg-white rounded-[2rem]"><CardContent className="p-6 flex items-center gap-4"><div className="p-3 bg-green-50 rounded-xl text-green-600"><CheckCircle2 className="w-6 h-6" /></div><div><p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Pago este Mês</p><h3 className="text-xl md:text-2xl font-black text-gray-900">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3></div></CardContent></Card>
        <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1"><Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-14 px-8 rounded-2xl shadow-lg w-full sm:w-auto font-black" onClick={() => { setSelectedBill(null); setIsModalOpen(true); }}><Plus className="w-5 h-5" /> Novo Lançamento</Button></div>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-white">
          <CardTitle className="text-xl font-black tracking-tight">Histórico de Lançamentos</CardTitle>
          <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Buscar imóvel ou inquilino..." className="pl-10 bg-gray-50 border-none h-11 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /><p className="text-gray-400 mt-4 font-medium">Carregando lançamentos...</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50"><TableRow><TableHead className="p-6 font-black text-[10px] uppercase tracking-widest">Tipo / Método</TableHead><TableHead className="p-6 font-black text-[10px] uppercase tracking-widest">Imóvel / Inquilino</TableHead><TableHead className="p-6 font-black text-[10px] uppercase tracking-widest">Referência</TableHead><TableHead className="p-6 font-black text-[10px] uppercase tracking-widest">Valor Final</TableHead><TableHead className="p-6 font-black text-[10px] uppercase tracking-widest">Status</TableHead><TableHead className="text-right p-6 font-black text-[10px] uppercase tracking-widest">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                      <TableCell className="p-6"><div className="flex items-center gap-3"><div className={cn("p-2.5 rounded-xl", bill.billing_method === 'consumo_kwh' ? 'bg-orange-50 text-orange-600' : bill.billing_method === 'por_pessoa' ? 'bg-blue-50 text-blue-600' : bill.type === 'aluguel' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600')}>{bill.type === 'energia' ? <Zap className="w-4 h-4" /> : bill.type === 'agua' ? <Droplets className="w-4 h-4" /> : <FileText className="w-4 h-4" />}</div><div><span className="font-bold capitalize text-sm block">{bill.type}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{bill.billing_method === 'consumo_kwh' ? 'Consumo kWh' : bill.billing_method === 'por_pessoa' ? `Rateio (${bill.residents} mor.)` : 'Fixo'}</span></div></div></TableCell>
                      <TableCell className="p-6"><p className="font-bold text-gray-900 text-sm">{bill.properties?.name || 'N/A'}</p><p className="text-[10px] text-gray-400 font-medium">{bill.tenants?.name || 'Sem inquilino'}</p></TableCell>
                      <TableCell className="p-6 text-gray-500 text-sm font-bold">{bill.month}/{bill.year}</TableCell>
                      <TableCell className="p-6"><p className="font-black text-sm text-gray-900">R$ {Number(bill.total_value || bill.calculated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></TableCell>
                      <TableCell className="p-6"><Badge className={cn("border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase", bill.status === 'pago' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{bill.status}</Badge></TableCell>
                      <TableCell className="p-6 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEdit(bill)}><Edit2 className="w-4 h-4" /></Button><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(bill.id)}><Trash2 className="w-4 h-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BillingModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['bills'] }); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['bills'] })} bill={selectedBill} />
    </DashboardLayout>
  );
};

export default Billing;