"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Download,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { cn } from '@/lib/utils';

const Financial = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: bills, isLoading, refetch } = useQuery({
    queryKey: ['bills-financial'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          tenants (name),
          properties (name)
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const stats = {
    totalRevenue: bills?.filter(b => b.status === 'pago').reduce((acc, b) => acc + (Number(b.total_value) || 0), 0) || 0,
    pendingRevenue: bills?.filter(b => b.status === 'pendente' || b.status === 'atrasado').reduce((acc, b) => acc + (Number(b.total_value) || 0), 0) || 0,
    overdueCount: bills?.filter(b => b.status === 'atrasado').length || 0
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pago':
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'atrasado':
        return "bg-rose-100 text-rose-700 border-rose-200 animate-pulse"; // Adicionado destaque para atrasado
      case 'pendente':
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return "Pago";
      case 'atrasado': return "Atrasado";
      case 'pendente': return "Pendente";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'aluguel': return "Aluguel";
      case 'energia': return "Energia";
      case 'agua': return "Água";
      case 'multa': return "Multa";
      case 'juros': return "Juros";
      case 'multa_juros': return "Multa/Juros";
      default: return type;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-slate-500 font-medium">Gestão de receitas, despesas e inadimplência.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold border-slate-200">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-black shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Receita Recebida</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-400">R$</span>
            <span className="text-3xl font-black text-slate-900">
              {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">A Receber (Pendente)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-400">R$</span>
            <span className="text-3xl font-black text-slate-900">
              {stats.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-[2.5rem] border shadow-sm transition-colors",
          stats.overdueCount > 0 ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              stats.overdueCount > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Faturas Atrasadas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-black",
              stats.overdueCount > 0 ? "text-rose-600" : "text-slate-900"
            )}>
              {stats.overdueCount}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase">Pendências</span>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por inquilino ou imóvel..." 
              className="pl-11 h-12 rounded-2xl bg-slate-50 border-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-xl font-bold text-slate-500">
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transação</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilino / Imóvel</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Ref.</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">Carregando transações...</td>
                </tr>
              ) : bills?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">Nenhuma transação encontrada.</td>
                </tr>
              ) : (
                bills?.filter(b => 
                  b.tenants?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  b.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          bill.status === 'pago' ? "bg-emerald-50 text-emerald-600" : 
                          bill.status === 'atrasado' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {bill.status === 'pago' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 capitalize">{getTypeLabel(bill.type)}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">ID: #{bill.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{bill.tenants?.name || 'N/A'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{bill.properties?.name || 'Sem imóvel'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{bill.month}/{bill.year}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={cn(
                        "text-sm font-black",
                        bill.status === 'atrasado' ? "text-rose-600" : "text-slate-900"
                      )}>
                        R$ {Number(bill.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn(
                        "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider",
                        getStatusStyles(bill.status)
                      )}>
                        {getStatusLabel(bill.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={() => {
          refetch();
          setIsModalOpen(false);
        }} 
      />
    </div>
  );
};

export default Financial;