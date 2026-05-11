import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calculator, ArrowRightLeft, Info } from 'lucide-react';
import { SharedBillModal } from '@/components/modals/SharedBillModal';

const SharedBills = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardLayout title="Contas Compartilhadas">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Divisão de Despesas</h2>
            <p className="text-slate-500 font-medium">Divida faturas de utilidades entre múltiplos inquilinos rapidamente.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-blue-100"
          >
            <Plus className="w-5 h-5" /> Nova Divisão
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white group hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Calculator className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">Como funciona?</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Insira o valor total de uma conta (ex: Luz do corredor). Selecione os inquilinos que devem pagar. O sistema divide o valor e cria uma conta pendente no perfil de cada um automaticamente.
            </p>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-slate-900 text-white">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
              <ArrowRightLeft className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-3">Integração Total</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              As contas geradas aqui aparecem instantaneamente no módulo Financeiro e nos resumos de cobrança do WhatsApp para cada inquilino.
            </p>
          </div>
        </div>

        <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-blue-900 tracking-tight">Dica de Gestão</h4>
            <p className="text-sm text-blue-700/70 font-medium mt-1">
              Use esta ferramenta para rateios de água, luz de áreas comuns ou internet compartilhada. É a forma mais rápida de "empurrar" despesas variáveis para os inquilinos.
            </p>
          </div>
        </div>
      </div>

      <SharedBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};

export default SharedBills;