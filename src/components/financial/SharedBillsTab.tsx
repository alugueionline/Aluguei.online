"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calculator, ArrowRightLeft, Info } from 'lucide-react';
import { SharedBillModal } from '@/components/financial/SharedBillModal';

export const SharedBillsTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Divisão de Despesas</h2>
          <p className="text-sm text-slate-500 font-medium">Divida faturas de utilidades entre múltiplos inquilinos rapidamente.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> Nova Divisão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-white group hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Como funciona?</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Insira o valor total de uma conta ou use a leitura de medidores. Selecione os inquilinos e o sistema gera as faturas individuais automaticamente.
          </p>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-slate-900 text-white">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-tight mb-2">Integração Total</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            As contas geradas aqui aparecem instantaneamente no módulo Financeiro e nos resumos de cobrança do WhatsApp para cada inquilino.
          </p>
        </Card>
      </div>

      <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-black text-blue-900 tracking-tight">Dica de Gestão</h4>
          <p className="text-xs text-blue-700/70 font-medium mt-1">
            Use o modo "Por Leitura (kWh)" para cobrar exatamente o que cada inquilino consumiu se você tiver medidores individuais.
          </p>
        </div>
      </div>

      <SharedBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};