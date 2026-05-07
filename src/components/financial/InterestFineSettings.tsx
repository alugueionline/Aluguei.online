"use client";

import React, { useState } from 'react';
import { Percent, Calendar, BellRing, ShieldCheck, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const InterestFineSettings = () => {
  const [config, setConfig] = useState({
    fixedFine: 10,
    monthlyInterest: 2,
    gracePeriod: 5,
    autoBilling: true,
    roundingType: 'standard'
  });

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Percent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Regras de Juros e Multas</CardTitle>
              <CardDescription>Configure as penalidades padrão para atrasos nos pagamentos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Multa Fixa por Atraso (%)
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={config.fixedFine}
                    onChange={(e) => setConfig({...config, fixedFine: Number(e.target.value)})}
                    className="pl-4 pr-10 h-11 rounded-xl border-gray-200 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500">Aplicada uma única vez sobre o valor total do aluguel.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Juros Mensais (%)
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={config.monthlyInterest}
                    onChange={(e) => setConfig({...config, monthlyInterest: Number(e.target.value)})}
                    className="pl-4 pr-10 h-11 rounded-xl border-gray-200 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500">Calculado proporcionalmente aos dias de atraso (pro-rata die).</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Carência (Dias)
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </label>
                <Input 
                  type="number" 
                  value={config.gracePeriod}
                  onChange={(e) => setConfig({...config, gracePeriod: Number(e.target.value)})}
                  className="h-11 rounded-xl border-gray-200 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">Dias após o vencimento antes de iniciar a cobrança de juros.</p>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BellRing className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Cobrança Automática</p>
                    <p className="text-xs text-gray-500">Atualizar valores no boleto/pix</p>
                  </div>
                </div>
                <Switch 
                  checked={config.autoBilling}
                  onCheckedChange={(checked) => setConfig({...config, autoBilling: checked})}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl px-6">Descartar</Button>
            <Button className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-200 transition-all">
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Status do Sistema</p>
            <p className="text-sm font-bold text-gray-900">Regras Ativas</p>
          </div>
        </div>
      </div>
    </div>
  );
};