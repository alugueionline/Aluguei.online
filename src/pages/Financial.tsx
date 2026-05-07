import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Plus,
  Search,
  Percent,
  Calculator,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterestFineSettings } from '@/components/financial/InterestFineSettings';
import { ApportionmentModule } from '@/components/financial/ApportionmentModule';

const Financial = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão Financeira</h1>
          <p className="text-gray-500 mt-1 font-medium">Controle avançado de recebimentos, juros e rateios</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold gap-2 h-11">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl font-bold gap-2 h-11 shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <Badge className="bg-green-50 text-green-700 border-none">+12.5%</Badge>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Receita Total</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">R$ 45.280,00</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <Badge className="bg-red-50 text-red-700 border-none">-2.4%</Badge>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Despesas</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">R$ 12.450,00</h3>
        </div>

        <div className="bg-[#2563FF] p-6 rounded-3xl shadow-xl shadow-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-bold text-white/70 uppercase tracking-wider">Saldo Líquido</p>
          <h3 className="text-2xl font-black text-white mt-1">R$ 32.830,00</h3>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
          <TabsTrigger value="overview" className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="apportionment" className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Calculator className="w-4 h-4" />
            Rateio de Contas
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Settings2 className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Buscar transações..." className="pl-10 bg-gray-50 border-none rounded-xl h-11" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="rounded-xl gap-2 font-bold text-gray-500">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </div>
            </div>
            <div className="p-8 text-center text-gray-500 font-medium">
              Lista de transações e histórico financeiro...
            </div>
          </div>
        </TabsContent>

        <TabsContent value="apportionment">
          <ApportionmentModule />
        </TabsContent>

        <TabsContent value="settings">
          <InterestFineSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;