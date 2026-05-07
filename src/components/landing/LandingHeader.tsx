"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const LandingHeader = () => {
  const navigate = useNavigate();
  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";

  const menuItems = [
    { label: 'Recursos', href: '#features' },
    { label: 'Financeiro', href: '#financial' },
    { label: 'WhatsApp', href: '#whatsapp' },
    { label: 'Relatórios', href: '#reports' },
    { label: 'Planos', href: '#pricing' },
  ];

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={logoUrl} alt="Aluguei.Online" className="h-10 w-auto object-contain" />
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')} 
            className="text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
          >
            Entrar
          </Button>
          <Button 
            onClick={() => navigate('/register')} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Começar Agora
          </Button>
        </div>
      </div>
    </motion.header>
  );
};