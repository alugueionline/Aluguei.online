"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  ChevronLeft, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessKey: ''
  });

  const logoUrl = "https://i.ibb.co/8nFsGk01/LOGO.png";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('As senhas não coincidem.');
      return;
    }

    const MASTER_KEY = "Aluguei.Online@2026";
    if (formData.accessKey !== MASTER_KEY) {
      showError('Chave de acesso inválida');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        showSuccess('Conta criada com sucesso! Bem-vindo.');
        navigate('/dashboard');
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[1100px] bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-10 lg:p-16 space-y-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/login')}>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Voltar para Login</span>
          </div>
          <div className="space-y-2">
            <img src={logoUrl} alt="Aluguei.Online" className="h-12 w-auto object-contain mb-4" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Criar Conta Privada</h1>
            <p className="text-slate-500 font-medium">Junte-se à elite da gestão imobiliária.</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  placeholder="Seu nome completo" 
                  className="h-12 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="h-12 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Chave de Acesso Exclusiva</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <Input 
                  type="password" 
                  placeholder="Insira sua chave de convite" 
                  className="h-14 pl-12 rounded-2xl bg-blue-50/30 border-2 border-blue-100 font-bold"
                  value={formData.accessKey}
                  onChange={(e) => setFormData({...formData, accessKey: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl">
              {isLoading ? 'Validando Acesso...' : 'Criar Minha Conta'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>
        </div>
        <div className="hidden lg:block bg-slate-900 p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative h-full flex flex-col justify-between text-white">
            <div className="space-y-8">
              <div className="w-16 h-1 bg-blue-600 rounded-full" />
              <h2 className="text-4xl font-black leading-tight">Sua jornada de gestão profissional começa aqui.</h2>
              <div className="space-y-6 pt-10">
                {['Acesso restrito e seguro', 'Automação de cobranças PIX', 'Relatórios de inteligência'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-300 font-bold text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;