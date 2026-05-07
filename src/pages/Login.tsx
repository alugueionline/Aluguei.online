"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, ArrowRight, ChevronLeft, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      showSuccess('Bem-vindo de volta!');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[1100px] bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Lado Esquerdo - Formulário */}
        <div className="p-12 lg:p-20 space-y-10">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Voltar para o site</span>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 mb-6">
              <Home className="text-white w-7 h-7" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Acesse sua conta</h1>
            <p className="text-slate-500 font-medium">Bem-vindo de volta ao Aluguei Online.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus-visible:ring-2 focus-visible:ring-blue-600/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</Label>
                <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Esqueci a senha</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus-visible:ring-2 focus-visible:ring-blue-600/10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-400">Ou entrar com</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-xl border-slate-100 font-bold gap-2 text-slate-600">
              <Chrome className="w-4 h-4" /> Google
            </Button>
            <Button variant="outline" className="h-12 rounded-xl border-slate-100 font-bold gap-2 text-slate-600">
              <Github className="w-4 h-4" /> GitHub
            </Button>
          </div>

          <p className="text-center text-sm font-bold text-slate-400">
            Não tem uma conta? <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Comece agora gratuitamente</button>
          </p>
        </div>

        {/* Lado Direito - Visual */}
        <div className="hidden lg:block bg-blue-600 p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative h-full flex flex-col justify-between text-white">
            <div className="space-y-6">
              <div className="w-16 h-1 bg-white/30 rounded-full" />
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                A plataforma que <br />
                evolui com o seu <br />
                negócio imobiliário.
              </h2>
              <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-md">
                "O Aluguei Online mudou a forma como gerencio meus 20 imóveis. O que levava dias agora leva minutos."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black">JS</div>
                <div>
                  <p className="font-black">Jonas Silva</p>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Proprietário & Gestor</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-3xl font-black">94%</p>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mt-1">Taxa de Ocupação</p>
              </div>
              <div>
                <p className="text-3xl font-black">+12k</p>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mt-1">Contratos Ativos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;