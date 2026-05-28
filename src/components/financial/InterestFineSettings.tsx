"use client";

import React, { useState, useEffect } from 'react';
import { Percent, Calendar, BellRing, Info, Scale, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

export const InterestFineSettings = () => {
  const [config, setConfig] = useState({
    finePercent: 12,
    interestRate: 1,
    interestType: 'weekly' as 'daily' | 'weekly' | 'monthly',
    gracePeriod: 0,
    autoBilling: true,
    roundingType: 'standard'
  });

  // Carrega as configurações salvas ao montar o componente
  useEffect(() => {
    const savedConfig = localStorage.getItem('aluguei_financial_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Erro ao carregar configurações financeiras:", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('aluguei_financial_config', JSON.stringify(config));
    showSuccess('Configurações financeiras salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b border-gray-50 bg-gray-50/30 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Percent className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Regras de Juros e Multas</CardTitle>
                <CardDescription className="text-sm font-medium">Configure as penalidades padrão aplicadas em caso de atraso</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-50 text-green-700 border-none font-bold px-4 py-1.5 rounded-full">
              Configurações Ativas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Multa Fixa (%)
                  <Info className="w-3.5 h-3.5 text-gray-300" />
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={config.finePercent}
                    onChange={(e) => setConfig({...config, finePercent: Number(e.target.value)})}
                    className="pl-4 pr-12 h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold focus:ring-[#2563FF]/20"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">%</span>
                </div>
                <p className="text-xs text-gray-400 font-medium italic">Aplicada sobre o valor total da parcela no primeiro dia de atraso.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Taxa de Juros (%)
                  <Info className="w-3.5 h-3.5 text-gray-300" />
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={config.interestRate}
                    onChange={(e) => setConfig({...config, interestRate: Number(e.target.value)})}
                    className="pl-4 pr-12 h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold focus:ring-[#2563FF]/20"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">%</span>
                </div>
                <p className="text-xs text-gray-400 font-medium italic">Valor cobrado proporcionalmente ao período de atraso selecionado ao lado.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Frequência de Cobrança dos Juros
                  <Clock className="w-3.5 h-3.5 text-gray-300" />
                </label>
                <Select 
                  value={config.interestType} 
                  onValueChange={(v: any) => setConfig({...config, interestType: v})}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário (ao dia - pro-rata die)</SelectItem>
                    <SelectItem value="weekly">Semanal (a cada 7 dias de atraso)</SelectItem>
                    <SelectItem value="monthly">Mensal (a cada 30 dias de atraso)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 font-medium italic">
                  {config.interestType === 'daily' && "Os juros sobem um pouco a cada dia de atraso."}
                  {config.interestType === 'weekly' && "Os juros sobem em blocos a cada semana completa de atraso."}
                  {config.interestType === 'monthly' && "Os juros sobem apenas quando completa um mês de atraso."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    Carência (Dias)
                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                  </label>
                  <Input 
                    type="number" 
                    value={config.gracePeriod}
                    onChange={(e) => setConfig({...config, gracePeriod: Number(e.target.value)})}
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold focus:ring-[#2563FF]/20"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    Arredondamento
                    <Scale className="w-3.5 h-3.5 text-gray-300" />
                  </label>
                  <Select value={config.roundingType} onValueChange={(v) => setConfig({...config, roundingType: v})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Padrão (2 casas)</SelectItem>
                      <SelectItem value="up">Sempre para cima</SelectItem>
                      <SelectItem value="no_decimals">Sem centavos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-blue-50/30 rounded-3xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 tracking-tight">Cobrança Automática Ativa</p>
                <p className="text-xs text-gray-500 font-medium">Novos valores serão atualizados automaticamente no PIX/Boleto</p>
              </div>
            </div>
            <Switch 
              checked={config.autoBilling}
              onCheckedChange={(checked) => setConfig({...config, autoBilling: checked})}
            />
          </div>

          <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end gap-4">
            <Button 
              variant="ghost" 
              className="rounded-xl px-8 font-bold text-gray-500"
              onClick={() => {
                localStorage.removeItem('aluguei_financial_config');
                window.location.reload();
              }}
            >
              Restaurar Padrão
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-10 font-bold h-12 shadow-lg shadow-blue-100 transition-all"
            >
              Salvar Configurações Financeiras
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};