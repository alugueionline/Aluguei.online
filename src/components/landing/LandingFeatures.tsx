"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  Zap, 
  MessageSquare, 
  Percent, 
  Users, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  DollarSign 
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: "Gestão de Imóveis",
    desc: "Organize todo o seu portfólio com fotos, detalhes e status em tempo real.",
    color: "blue"
  },
  {
    icon: FileText,
    title: "Contratos Inteligentes",
    desc: "Gere e armazene contratos de locação com vigência e reajustes automáticos.",
    color: "purple"
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    desc: "Envie cobranças profissionais formatadas direto para o celular do inquilino.",
    color: "emerald"
  },
  {
    icon: DollarSign,
    title: "Recebimentos PIX",
    desc: "Facilite o pagamento com chaves PIX integradas em todos os resumos.",
    color: "amber"
  },
  {
    icon: Percent,
    title: "Juros Automáticos",
    desc: "Cálculo pro-rata die de multas e juros para pagamentos em atraso.",
    color: "rose"
  },
  {
    icon: Users,
    title: "Rateio de Contas",
    desc: "Divida contas de água e luz entre unidades de forma justa e rápida.",
    color: "indigo"
  }
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Funcionalidades</h2>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Tudo o que você precisa para uma gestão profissional.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-100/50 transition-all group cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{f.title}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};