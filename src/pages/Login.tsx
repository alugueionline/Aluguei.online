"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ChevronLeft, Key, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessKey) {
      showError('A chave de acesso é obrigatória.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      showSuccess('Acesso autorizado!');
      navigate('/dashboard');
    }, 1200);
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
            <div className="w-auto h-16 bg-white rounded-2xl flex items-center justify-center mb-6">
              <img src={logoUrl} alt="Aluguei.Online" className="h-full w-auto object-contain" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Acesso Assinante</h1>
            <p className="text-slate-500 font-medium">Insira suas credenciais e sua chave de acesso exclusiva.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Autorizado</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus-visible:ring-2 focus-visible:ring-blue-600/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Chave de Acesso (Obrigatório)</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <Input 
                  type="password" 
                  placeholder="Insira sua chave de assinante" 
                  className="h-14 pl-12 rounded-2xl bg-blue-50/30 border-2 border-blue-100 font-bold focus-visible:ring-2 focus-visible:ring-blue-600/10"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</Label>
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
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95"
            >
              {isLoading ? 'Validando Chave...' : 'Entrar no Sistema'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          <div className="flex flex-col gap-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Este sistema é monitorado. O uso de chaves não autorizadas resultará no bloqueio permanente do IP.
              </p>
            </div>
            
            <p className="text-center text-sm font-bold text-slate-500">
              Não tem uma conta?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:underline"
              >
                Cadastre-se com sua chave
              </button>
            </p>
          </div>
        </div>

        {/* Lado Direito - Visual */}
        <div className="hidden lg:block bg-slate-900 p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          
          <div className="relative h-full flex flex-col justify-between text-white">
            <div className="space-y-6">
              <div className="w-16 h-1 bg-blue-600 rounded-full" />
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Segurança e <br />
                Exclusividade na <br />
                sua Gestão.
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                Acesse o painel de controle para gerenciar suas propriedades, contratos e fluxos financeiros com total privacidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;