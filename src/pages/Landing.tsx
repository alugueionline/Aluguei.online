"use client";

import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { WhatsAppFeature } from '@/components/landing/WhatsAppFeature';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { motion, useScroll, useSpring } from 'framer-motion';

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] selection:bg-blue-100 selection:text-blue-900">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]" 
        style={{ scaleX }} 
      />

      <LandingHeader />
      
      <main>
        <LandingHero />
        
        {/* Social Proof / Logos Section */}
        <section className="py-12 border-y border-slate-100 bg-white/50">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale">
            <span className="text-xl font-black tracking-tighter">STRIPE</span>
            <span className="text-xl font-black tracking-tighter">LINEAR</span>
            <span className="text-xl font-black tracking-tighter">VERCEL</span>
            <span className="text-xl font-black tracking-tighter">NOTION</span>
            <span className="text-xl font-black tracking-tighter">FRAMER</span>
          </div>
        </section>

        <LandingFeatures />
        
        <WhatsAppFeature />
        
        {/* Dashboard Showcase Section */}
        <section id="reports" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-10 bg-blue-600/5 rounded-[4rem] blur-3xl -z-10" />
                <img 
                  src="https://i.ibb.co/yF9YXMC9/1.jpg" 
                  alt="Relatórios" 
                  className="rounded-[2.5rem] shadow-2xl border border-slate-100"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Inteligência</h2>
                <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Relatórios que mostram a <span className="text-blue-600">verdade.</span>
                </h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Saiba exatamente quanto está lucrando, qual sua taxa de ocupação e preveja recebimentos futuros com gráficos de alta precisão.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">100%</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Precisão</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">Real-time</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronização</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingSection />
        
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
};

export default Landing;