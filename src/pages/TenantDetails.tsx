"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Home,
  CreditCard,
  History,
  ShieldCheck,
  Clock,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, properties(name, base_rent)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Carregando perfil do inquilino...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!tenant) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Inquilino não encontrado</h2>
          <Button onClick={() => navigate('/tenants')} className="mt-4">Voltar para Lista</Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Não definida';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout title="Perfil do Inquilino">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2 text-gray-500 hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem]">
            <div className="h-32 bg-blue-600" />
            <CardContent className="relative pt-0">
              <div className="absolute -top-12 left-6">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-12 h-12" />
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                <Badge className="mt-2 bg-green-50 text-green-700 border-none uppercase text-[10px] font-black">
                  {tenant.status}
                </Badge>
              </div>
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold">{tenant.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold">{tenant.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold">CPF: {tenant.cpf || 'Não informado'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-50 border-blue-100 rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black text-blue-800 flex items-center gap-2 uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Vigência do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Início</p>
                <p className="text-sm font-black text-blue-900">{formatDate(tenant.contract_start_date)}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Término</p>
                <p className="text-sm font-black text-blue-900">{formatDate(tenant.contract_end_date)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-emerald-50 border-emerald-100 rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black text-emerald-800 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Aluguel Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-black text-emerald-900">
                  R$ {Number(tenant.properties?.base_rent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                  Valor base do imóvel
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-[2rem]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Imóvel Atual</p>
                  <p className="text-lg font-black text-gray-900">{tenant.properties?.name || 'Não vinculado'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[2rem]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Data de Cadastro</p>
                  <p className="text-lg font-black text-gray-900">{formatDate(tenant.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                <History className="w-5 h-5 text-blue-600" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-10 text-center text-slate-400 font-medium">
                Nenhum pagamento registrado no histórico.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TenantDetails;