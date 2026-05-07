"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  MoreHorizontal, 
  Download, 
  Eye,
  Clock,
  ArrowUpRight,
  User,
  Home as HomeIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

const contracts = [
  { 
    id: '1', 
    tenant: 'João Silva', 
    property: 'Apto 101', 
    start: '2024-01-10', 
    end: '2025-01-10', 
    value: 1200, 
    status: 'vigente',
    financialStatus: 'em_dia',
    progress: 45
  },
  { 
    id: '2', 
    tenant: 'Maria Oliveira', 
    property: 'Casa 02', 
    start: '2024-03-15', 
    end: '2025-03-15', 
    value: 2500, 
    status: 'vigente',
    financialStatus: 'atraso',
    progress: 20
  },
  { 
    id: '3', 
    tenant: 'Pedro Santos', 
    property: 'Kitnet A', 
    start: '2023-05-05', 
    end: '2024-05-05', 
    value: 850, 
    status: 'vencido',
    financialStatus: 'em_dia',
    progress: 100
  },
  { 
    id: '4', 
    tenant: 'Ana Costa', 
    property: 'Apto 202', 
    start: '2024-06-01', 
    end: '2025-06-01', 
    value: 1350, 
    status: 'aguardando_assinatura',
    financialStatus: 'em_dia',
    progress: 0
  },
];

const Contracts = () => {
  return (
    <DashboardLayout title="Gestão de Contratos">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="relative w-full lg:w-[500px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563FF] transition-colors" />
            <Input 
              placeholder="Buscar contratos, inquilinos ou imóveis..." 
              className="pl-12 h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-[#2563FF]/10 transition-all text-base" 
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white font-bold text-slate-600 gap-2 flex-1 lg:flex-none">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-bold gap-2 flex-1 lg:flex-none shadow-lg shadow-blue-100">
              <Plus className="w-5 h-5" /> Novo Contrato
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryMiniCard label="Total Ativos" value="12" icon={<CheckCircle2 className="text-emerald-500" />} />
          <SummaryMiniCard label="A Vencer (30d)" value="3" icon={<Clock className="text-amber-500" />} />
          <SummaryMiniCard label="Pendentes" value="2" icon={<AlertCircle className="text-blue-500" />} />
          <SummaryMiniCard label="Inadimplência" value="8.4%" icon={<ArrowUpRight className="text-rose-500" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {contracts.map((c) => (
            <Card key={c.id} className="premium-card rounded-[2.5rem] overflow-hidden group hover:translate-y-[-4px]">
              <CardContent className="p-0">
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{c.tenant}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs mt-1">
                          <HomeIcon className="w-3 h-3" /> {c.property}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-slate-300 hover:text-slate-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mb-8">
                    <Badge className={cn(
                      "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none",
                      c.status === 'vigente' ? "bg-emerald-50 text-emerald-700" :
                      c.status === 'vencido' ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                    )}>
                      {c.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={cn(
                      "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none",
                      c.financialStatus === 'em_dia' ? "bg-slate-50 text-slate-500" : "bg-rose-100 text-rose-800"
                    )}>
                      {c.financialStatus === 'em_dia' ? 'Em dia' : 'Em atraso'}
                    </Badge>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progresso do Contrato</span>
                      <span className="text-xs font-black text-slate-900">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5 bg-slate-50" indicatorClassName="bg-[#2563FF]" />
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                    <p className="text-sm font-black text-slate-900">{new Date(c.end).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mensalidade</p>
                    <p className="text-sm font-black text-[#2563FF]">R$ {c.value.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-2">
                  <Button variant="ghost" className="rounded-xl h-12 font-bold text-slate-500 hover:bg-white hover:text-blue-600 gap-2 text-xs">
                    <Download className="w-4 h-4" /> Download PDF
                  </Button>
                  <Button variant="ghost" className="rounded-xl h-12 font-bold text-slate-500 hover:bg-white hover:text-blue-600 gap-2 text-xs">
                    <Eye className="w-4 h-4" /> Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryMiniCard = ({ label, value, icon }: any) => (
  <Card className="premium-card border-none bg-white p-6 rounded-3xl flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-xl font-black text-slate-900">{value}</h4>
    </div>
  </Card>
);

export default Contracts;