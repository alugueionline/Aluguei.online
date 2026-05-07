"use client";

import React from 'react';
import { MessageSquare, Send, CheckCheck, User } from 'lucide-react';

export const WhatsAppFeature = () => {
  return (
    <section id="whatsapp" className="py-32 bg-slate-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Cobranças prontas para envio no <span className="text-emerald-600">WhatsApp.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Esqueça o constrangimento de cobrar. O sistema gera um resumo profissional com todos os valores detalhados e chave PIX, pronto para você enviar em um clique.
            </p>
            
            <div className="space-y-4 pt-4">
              {['Resumo consolidado de aluguel + utilidades', 'Cálculo automático de juros e multas', 'Chave PIX inclusa na mensagem'].map(item => (
                <div key={item} className="flex items-center gap-3 text-slate-700 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-in fade-in scale-in-95 duration-1000">
            <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-800 relative z-10">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">João Silva (Inquilino)</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-6 text-slate-300 text-sm font-medium leading-relaxed border border-slate-700/50 max-w-[85%] animate-in fade-in slide-in-from-left-4 duration-500 delay-300 fill-mode-both">
                  Olá João! 👋 <br /><br />
                  Estou enviando o resumo do aluguel e demais valores deste mês: <br /><br />
                  • Aluguel: R$ 1.200,00 <br />
                  • Energia: R$ 145,20 <br />
                  • Água: R$ 60,00 <br /><br />
                  💰 *Total a pagar: R$ 1.405,20* <br /><br />
                  🔑 *Chave PIX:* seu-pix@email.com <br /><br />
                  Qualquer dúvida, estou à disposição!
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
                    Enviado às 09:41
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex gap-3">
                <div className="flex-1 h-12 bg-slate-800 rounded-xl border border-slate-700" />
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Send className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};