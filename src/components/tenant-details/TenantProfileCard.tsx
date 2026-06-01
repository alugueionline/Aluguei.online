"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, CreditCard, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantProfileCardProps {
  tenant: any;
  financialData: {
    totalOverdue: number;
    totalPaid: number;
  } | undefined;
}

export const TenantProfileCard = ({ tenant, financialData }: TenantProfileCardProps) => {
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 gap-4">
        <Card className={cn(
          "border-none shadow-sm rounded-[2rem]", 
          financialData?.totalOverdue && financialData.totalOverdue > 0 ? "bg-rose-50 border-rose-100" : "bg-white"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "text-sm font-black flex items-center gap-2 uppercase tracking-widest", 
              financialData?.totalOverdue && financialData.totalOverdue > 0 ? "text-rose-800" : "text-slate-400"
            )}>
              {financialData?.totalOverdue && financialData.totalOverdue > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} 
              Dívida Atrasada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-black", financialData?.totalOverdue && financialData.totalOverdue > 0 ? "text-rose-900" : "text-slate-900")}>
              R$ {financialData?.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-blue-50 border-blue-100 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-blue-800 flex items-center gap-2 uppercase tracking-widest">
              <Wallet className="w-4 h-4" /> Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-blue-900">
              R$ {financialData?.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};