"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  MessageSquare, 
  BarChart3, 
  ArrowRight,
  Key,
  Lock,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Landing = () => {
  const navigate = useNavigate();
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";
  const appImg1 = "https://i.ibb.co/yF9YXMC9/1.jpg"; 
  const appImg2 = "https://i.ibb.co/xS6Ywfdq/2.jpg"; 

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logoUrl} alt="Aluguei.Online" className="h-12 w-auto object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-blue-600">
              Entrar
            </Button>
            <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-lg transition-all active:scale-95 gap-2">
              <Key className="w-4 h-4" /> Ativar Acesso
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
              🔒 Sistema de Gestão Exclusivo
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Gestão de elite para <br />
              <span className="text-blue-600">quem valoriza o tempo.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              O sistema definitivo para proprietários que exigem precisão absoluta e automação total.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 gap-2">
                Acessar Painel <ArrowRight className="w-5 h-5" />
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline" className="h-14 px-10 rounded-2xl border-blue-200 text-blue-600 font-black text-lg hover:bg-blue-50 transition-all gap-2">
                <UserPlus className="w-5 h-5" /> Ativar com Chave
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-3xl" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <img src={appImg1} alt="Dashboard" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Cobrança via WhatsApp</h3>
<dyad-write path="src/pages/Landing.tsx" description="Finalizando a Landing Page com a separação clara entre Login e Ativação por Chave.">
"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  MessageSquare, 
  BarChart3, 
  ArrowRight,
  Key,
  Lock,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Landing = () => {
  const navigate = useNavigate();
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";
  const appImg1 = "https://i.ibb.co/yF9YXMC9/1.jpg"; 
  const appImg2 = "https://i.ibb.co/xS6Ywfdq/2.jpg"; 

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logoUrl} alt="Aluguei.Online" className="h-12 w-auto object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-blue-600">
              Entrar
            </Button>
            <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-lg transition-all active:scale-95 gap-2">
              <Key className="w-4 h-4" /> Ativar Acesso
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
              🔒 Sistema de Gestão Exclusivo
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Gestão de elite para <br />
              <span className="text-blue-600">quem valoriza o tempo.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              O sistema definitivo para proprietários que exigem precisão absoluta e automação total.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 gap-2">
                Acessar Painel <ArrowRight className="w-5 h-5" />
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline" className="h-14 px-10 rounded-2xl border-blue-200 text-blue-600 font-black text-lg hover:bg-blue-50 transition-all gap-2">
                <UserPlus className="w-5 h-5" /> Ativar com Chave
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-3xl" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <img src={appImg1} alt="Dashboard" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Cobrança via WhatsApp</h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Gere resumos de aluguel e utilidades formatados para envio imediato. Reduza a inadimplência com comunicação direta.
              </p>
              <ul className="space-y-3">
                {['Resumo consolidado', 'Chave PIX automática', 'Cálculo de juros e multas'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800">
              <div className="bg-slate-800/50 rounded-2xl p-6 text-slate-300 text-sm font-medium leading-relaxed border border-slate-700/50">
                Olá! 👋 <br /><br />
                Segue o resumo do aluguel deste mês: <br /><br />
                • Aluguel: R$ 1.200,00 <br />
                • Energia: R$ 145,20 <br /><br />
                💰 *Total: R$ 1.345,20* <br /><br />
                🔑 *PIX:* sua-chave-aqui
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Aluguei.Online" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-xs font-bold text-slate-400">© 2024 Aluguei.Online. Acesso restrito a assinantes autorizados.</p>
          <div className="flex gap-6">
            <Lock className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
            <ShieldCheck className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;