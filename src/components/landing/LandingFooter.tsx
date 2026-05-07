"use client";

import React from 'react';
import { ShieldCheck, Lock, Instagram, Linkedin, Twitter } from 'lucide-react';

export const LandingFooter = () => {
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";

  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <img src={logoUrl} alt="Aluguei.Online" className="h-10 w-auto object-contain" />
            <p className="text-lg text-slate-500 font-medium max-w-sm leading-relaxed">
              A plataforma definitiva para proprietários que buscam profissionalismo e liberdade na gestão de seus imóveis.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={Instagram} />
              <SocialIcon icon={Linkedin} />
              <SocialIcon icon={Twitter} />
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Produto</h5>
            <ul className="space-y-4">
              <FooterLink label="Recursos" href="#features" />
              <FooterLink label="WhatsApp" href="#whatsapp" />
              <FooterLink label="Planos" href="#pricing" />
              <FooterLink label="Demonstração" href="#" />
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Suporte</h5>
            <ul className="space-y-4">
              <FooterLink label="Central de Ajuda" href="#" />
              <FooterLink label="Termos de Uso" href="#" />
              <FooterLink label="Privacidade" href="#" />
              <FooterLink label="Contato" href="#" />
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-sm font-bold text-slate-400">
            © 2024 Aluguei.Online. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <Lock className="w-4 h-4" /> Segurança Bancária
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Dados Criptografados
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href }: { label: string, href: string }) => (
  <li>
    <a href={href} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
      {label}
    </a>
  </li>
);

const SocialIcon = ({ icon: Icon }: { icon: any }) => (
  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
    <Icon className="w-5 h-5" />
  </div>
);