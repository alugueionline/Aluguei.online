"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';

export const PricingSection = () => {
  const navigate = useNavigate();

  const benefits = [
    "Imóveis ilimitados",
    "Inquilinos ilimitados",
    "Contratos ilimitados",
    "Cobranças via WhatsApp",
    "Cálculo de juros automático",
    "Relatórios financeiros",
    "Suporte prioritário",
    "Acesso vitalício às atualizações"
  ];

  return (
    <section id="pricing" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Preço Justo</h2>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Um único plano para <br /> dominar sua gestão.
          </h3>
        </div>

        <div className="max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-2xl -z-10" />
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="w-8 h-8 text-blue-100" />
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Acesso Ilimitado</h4>
                <p className="text-slate-500 font-medium mt-2">Tudo o que você precisa, sem letras miúdas.</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">R$ 99</span>
                <span className="text-xl font-bold text-slate-400">/mês</span>
              </div>

              <div className="space-y-4 pt-4">
                {benefits.map(b => (
                  <div key={b} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    {b}
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => navigate('/register')}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                Começar Agora
              </Button>
              
              <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Cancele a qualquer momento
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};