"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Home, 
  Calendar,
  ArrowRight,
  Star,
  Smartphone,
  Globe,
  Lock,
  Key,
  Calculator,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();
  const logoUrl = "https://i.ibb.co/HpMZDMpS/ICONE-ESCURO.png"; // Usando a versão direta da logo enviada anteriormente que funciona bem em fundo claro

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-black text-slate-900 tracking-tight">Aluguei<span className="text-blue-600">Online</span></span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-8">
              {['Recursos', 'Tour do Produto', 'Financeiro', 'WhatsApp'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-blue-600">
              Entrar
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 font-bold shadow-lg transition-all active:scale-95 gap-2">
              <Key className="w-4 h-4" /> Acessar com Chave
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
              🔒 Acesso Restrito a Convidados
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Gestão de elite para <br />
              <span className="text-blue-600">grandes carteiras.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              O sistema definitivo para proprietários e gestores que exigem precisão absoluta, automação de cobrança e relatórios de inteligência.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95 gap-2">
                Entrar no Sistema <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 font-black text-lg text-slate-600 hover:bg-slate-50 transition-all">
                Solicitar Chave
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-3xl" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bbbda546697c?w=800&q=80" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Status da Carteira</p>
                  <p className="text-lg font-black text-slate-900">94.2% Ocupação</p>
                </div>
                <div className="bg-emerald-500 p-4 rounded-2xl shadow-xl text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tour - Provas de Funcionalidade */}
      <section id="tour-do-produto" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Funcionalidades que você realmente vai usar.</h2>
            <p className="text-lg text-slate-500 font-medium">Construído para resolver as dores reais do dia a dia da gestão imobiliária.</p>
          </div>

          <div className="space-y-32">
            {/* Feature 1: WhatsApp Billing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Preview WhatsApp</span>
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-6 text-slate-300 text-sm font-medium leading-relaxed border border-slate-700/50">
                    Olá João! 👋 <br /><br />
                    Estou enviando o resumo do aluguel deste mês: <br /><br />
                    • Aluguel: R$ 1.200,00 <br />
                    • Energia: R$ 145,20 <br />
                    • Água: R$ 80,00 <br /><br />
                    💰 *Total: R$ 1.425,20* <br /><br />
                    🔑 *PIX:* seu-pix@email.com
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1 rounded-full text-[10px] font-black uppercase">Gerado Automaticamente</Badge>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Cobrança via WhatsApp em 1 clique</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  O sistema consolida aluguel, taxas e consumos, calcula juros se houver atraso e gera a mensagem formatada. Você só precisa clicar em enviar.
                </p>
                <ul className="space-y-3">
                  {['Resumo detalhado de custos', 'Chave PIX inclusa', 'Cálculo de juros pro-rata die'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 2: Apportionment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Calculator className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Rateio Inteligente de Despesas</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  Divida contas de áreas comuns ou faturas globais entre as unidades de forma justa. O sistema faz o cálculo e lança individualmente em cada contrato.
                </p>
                <ul className="space-y-3">
                  {['Divisão por unidade ou por pessoa', 'Histórico de rateios processados', 'Lançamento automático no financeiro'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-black text-slate-900">Módulo de Rateio</h4>
                  <Badge className="bg-blue-50 text-blue-600 border-none">Ativo</Badge>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Fatura de Água Global</span>
                    <span className="font-black text-slate-900">R$ 600,00</span>
                  </div>
                  <div className="flex justify-center py-2">
                    <ArrowRight className="w-6 h-6 text-slate-300 rotate-90" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-blue-100 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase">Unidade 101</p>
                      <p className="text-sm font-black text-blue-600">R$ 150,00</p>
                    </div>
                    <div className="p-4 border border-blue-100 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase">Unidade 102</p>
                      <p className="text-sm font-black text-blue-600">R$ 150,00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Financial Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />
                <div className="relative space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-black">Performance Anual</h4>
                    <BarChart3 className="text-blue-400 w-6 h-6" />
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 90, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-600/40 rounded-t-lg transition-all hover:bg-blue-500" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="pt-6 border-t border-slate-800 flex justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Receita Total</p>
                      <p className="text-lg font-black text-white">R$ 185.400</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase">Crescimento</p>
                      <p className="text-lg font-black text-emerald-400">+18.4%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Inteligência de Dados</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  Tome decisões baseadas em números. Saiba exatamente qual imóvel é mais rentável e onde estão seus maiores custos de manutenção.
                </p>
                <ul className="space-y-3">
                  {['Gráficos de evolução mensal', 'Mix de performance por imóvel', 'Exportação de relatórios em PDF'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Pronto para elevar o nível <br />
            <span className="text-blue-600">da sua gestão?</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            O Aluguei Online é uma plataforma exclusiva. Se você já possui uma chave de acesso, entre agora. Caso contrário, solicite seu convite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/login')} className="h-16 px-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 gap-3">
              <Key className="w-6 h-6" /> Acessar com Chave
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black text-slate-900 tracking-tight">Aluguei<span className="text-blue-600">Online</span></span>
          </div>
          <p className="text-xs font-bold text-slate-400">© 2024 Aluguei Online. Acesso restrito a gestores autorizados.</p>
          <div className="flex gap-6">
            <Lock className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
            <ShieldCheck className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
);

export default Landing;