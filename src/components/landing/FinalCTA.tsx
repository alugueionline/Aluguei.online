"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden animate-in fade-in scale-in-95 duration-1000">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-10">
          <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Seu aluguel merece um <br /> sistema profissional.
          </h2>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Junte-se a centenas de proprietários que profissionalizaram sua gestão e recuperaram seu tempo livre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={() => navigate('/register')}
              className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-900/20 transition-all active:scale-95 gap-3"
            >
              Começar Agora <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Sem fidelidade. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
};