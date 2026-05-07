"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Home className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">Aluguei<span className="text-blue-600">Online</span></span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-8">
              {['Recursos', 'Funcionalidades', 'Financeiro', 'WhatsApp', 'Planos'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-blue-600">
              Entrar
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
              🚀 Gestão Imobiliária 2.0
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Seus aluguéis <br />
              <span className="text-blue-600">sem planilhas.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Controle imóveis, contratos, cobranças e recebimentos em um único sistema moderno, inteligente e 100% brasileiro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95">
                Testar grátis
              </Button>
              <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 font-black text-lg text-slate-600 hover:bg-slate-50 transition-all">
                Ver demonstração
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-600">Cobrança via WhatsApp</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-600">PIX Integrado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-600">Controle Financeiro</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-600">Gestão de Contratos</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-3xl" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto bg-white px-4 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400">
                  app.alugueionline.com.br/dashboard
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" 
                alt="Dashboard Preview" 
                className="w-full h-auto opacity-90 grayscale-[20%]"
              />
              {/* Floating Card Overlay */}
              <div className="absolute bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Mensal</p>
                    <p className="text-xl font-black text-slate-900">R$ 15.420,00</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tudo o que você precisa para escalar sua gestão.</h2>
            <p className="text-lg text-slate-500 font-medium">Funcionalidades pensadas para quem cansou de perder tempo com processos manuais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Home className="w-6 h-6" />}
              title="Gestão de Imóveis"
              desc="Organize fotos, documentos e detalhes técnicos de cada unidade em segundos."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Controle Financeiro"
              desc="Fluxo de caixa automático com visão clara de entradas, saídas e lucro líquido."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Cobrança Automática"
              desc="O sistema calcula juros e multas pro-rata e gera o resumo pronto para envio."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="WhatsApp Integrado"
              desc="Envie lembretes e comprovantes diretamente para o celular do inquilino."
            />
            <FeatureCard 
              icon={<Calculator className="w-6 h-6" />}
              title="Rateio de Contas"
              desc="Divida contas de água e luz entre unidades de forma justa e automática."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Agenda Inteligente"
              desc="Nunca mais esqueça uma vistoria ou o vencimento de um contrato importante."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Contratos Seguros"
              desc="Armazenamento em nuvem de todos os termos e aditivos com acesso rápido."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6" />}
              title="Mobile First"
              desc="Acesse e gerencie tudo do seu celular, de onde estiver, com interface fluida."
            />
          </div>
        </div>
      </section>

      {/* WhatsApp Section */}
      <section id="whatsapp" className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-24 relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-8">
              <Badge className="bg-blue-500/20 text-blue-400 border-none px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
                💬 Comunicação Ágil
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Cobranças prontas para <br />
                <span className="text-blue-400 text-emerald-400">envio no WhatsApp.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                Esqueça o trabalho de digitar valores todo mês. O Aluguei Online gera a mensagem personalizada com valores atualizados, juros calculados e sua chave PIX.
              </p>
              <ul className="space-y-4">
                {[
                  'Cálculo automático de juros e multas',
                  'Resumo detalhado (Aluguel + Contas)',
                  'Chave PIX integrada na mensagem',
                  'Envio em um clique'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300 font-bold">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Preview da Mensagem</p>
                  <p className="text-sm font-bold text-white">WhatsApp Business</p>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-2xl p-6 text-slate-300 text-sm font-medium leading-relaxed border border-slate-700/50">
                Olá João! 👋 <br /><br />
                Estou enviando o resumo do aluguel deste mês: <br /><br />
                • Aluguel: R$ 1.200,00 <br />
                • Energia: R$ 145,20 <br />
                • Água: R$ 80,00 <br /><br />
                💰 *Total: R$ 1.425,20* <br /><br />
                🔑 *PIX:* seu-pix@email.com
              </div>
              <Button className="w-full mt-8 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black gap-2 shadow-xl shadow-emerald-900/20">
                Enviar Cobrança <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Planos que crescem com você.</h2>
            <p className="text-lg text-slate-500 font-medium">Escolha a melhor opção para o tamanho da sua carteira de imóveis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              name="Starter"
              price="49"
              desc="Ideal para quem está começando a profissionalizar a gestão."
              features={['Até 5 imóveis', 'Gestão de Contratos', 'Cobrança via WhatsApp', 'Suporte via Email']}
            />
            <PricingCard 
              name="Pro"
              price="149"
              desc="O plano favorito de gestores e pequenas imobiliárias."
              features={['Até 50 imóveis', 'Relatórios Financeiros', 'Rateio de Contas', 'Suporte Prioritário']}
              popular
            />
            <PricingCard 
              name="Premium"
              price="399"
              desc="Para grandes carteiras que precisam de controle total."
              features={['Imóveis Ilimitados', 'Inteligência de Dados', 'Multi-usuários', 'Gerente de Conta']}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-50/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <TestimonialCard 
              content="Saí do Excel e nunca mais olhei para trás. O sistema de cobrança via WhatsApp me economiza horas toda semana."
              author="Ricardo Santos"
              role="Proprietário de 12 imóveis"
            />
            <TestimonialCard 
              content="A interface é extremamente limpa e fácil de usar. Meus inquilinos adoram a clareza dos resumos que envio."
              author="Ana Paula"
              role="Gestora Imobiliária"
            />
            <TestimonialCard 
              content="O rateio de contas era meu maior pesadelo. Com o Aluguei Online, faço tudo em 2 minutos. Sensacional!"
              author="Marcos Oliveira"
              role="Administrador de Condomínios"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Pare de controlar <br />
            <span className="text-blue-600">aluguel no Excel.</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Junte-se a centenas de gestores que profissionalizaram seus negócios com o Aluguei Online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/login')} className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-100 transition-all active:scale-95">
              Começar Gratuitamente
            </Button>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sem cartão de crédito • Teste grátis por 7 dias</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">Aluguei<span className="text-blue-600">Online</span></span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              A plataforma definitiva para gestão imobiliária moderna e inteligente.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Produto</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-blue-600">Recursos</a></li>
              <li><a href="#" className="hover:text-blue-600">Financeiro</a></li>
              <li><a href="#" className="hover:text-blue-600">WhatsApp</a></li>
              <li><a href="#" className="hover:text-blue-600">Planos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Suporte</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-blue-600">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-blue-600">Contato</a></li>
              <li><a href="#" className="hover:text-blue-600">Status do Sistema</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-blue-600">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacidade</a></li>
              <li><a href="#" className="hover:text-blue-600">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400">© 2024 Aluguei Online. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Globe className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
            <Smartphone className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
            <Lock className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const PricingCard = ({ name, price, desc, features, popular }: any) => (
  <div className={cn(
    "p-10 rounded-[2.5rem] border transition-all relative",
    popular ? "bg-white border-blue-200 shadow-2xl scale-105 z-10" : "bg-white border-slate-100 shadow-sm hover:shadow-md"
  )}>
    {popular && (
      <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
        Mais Popular
      </Badge>
    )}
    <h3 className="text-xl font-black text-slate-900 mb-2">{name}</h3>
    <p className="text-sm text-slate-500 font-medium mb-8">{desc}</p>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-sm font-black text-slate-400">R$</span>
      <span className="text-5xl font-black text-slate-900">{price}</span>
      <span className="text-sm font-bold text-slate-400">/mês</span>
    </div>
    <ul className="space-y-4 mb-10">
      {features.map((f: string) => (
        <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          {f}
        </li>
      ))}
    </ul>
    <Button className={cn(
      "w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95",
      popular ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100" : "bg-slate-50 hover:bg-slate-100 text-slate-900"
    )}>
      Começar Agora
    </Button>
  </div>
);

const TestimonialCard = ({ content, author, role }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
    </div>
    <p className="text-lg font-medium text-slate-700 leading-relaxed italic">"{content}"</p>
    <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black">
        {author[0]}
      </div>
      <div>
        <p className="font-black text-slate-900 text-sm">{author}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </div>
);

const DollarSign = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

const Calculator = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
);

export default Landing;