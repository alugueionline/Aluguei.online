"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTenantAvatar } from '@/utils/avatar';

interface RecentPaymentsTableProps {
  payments: any[];
}

export const RecentPaymentsTable = ({ payments }: RecentPaymentsTableProps) => {
  return (
    <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">Recebimentos recentes</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Últimas transações confirmadas</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/30">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquilino</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imóvel</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-4 text-xs font-medium text-slate-500">{p.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 rounded-md border border-slate-100">
                        <AvatarImage src={getTenantAvatar(p.tenantName)} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-[9px] font-bold">
                          {p.tenantName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-slate-900">{p.tenantName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-500">{p.property}</td>
                  <td className="p-4 text-xs font-black text-slate-900">
                    R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-md">
                      Pago
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs font-medium text-slate-400">
                  Nenhum recebimento recente registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};