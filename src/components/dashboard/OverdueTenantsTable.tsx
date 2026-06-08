"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTenantAvatar } from '@/utils/avatar';

interface OverdueTenantsTableProps {
  tenants: any[];
  getDaysOverdue: (tenant: any) => number;
  onCobrarClick: (tenantId: string) => void;
  onOpenCentral: () => void;
}

export const OverdueTenantsTable = ({ tenants, getDaysOverdue, onCobrarClick, onOpenCentral }: OverdueTenantsTableProps) => {
  return (
    <Card className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Inquilinos em atraso</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ações de cobrança necessárias</p>
        </div>
        <Button 
          onClick={onOpenCentral}
          variant="outline"
          className="h-8 px-3 rounded-lg border-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-50"
        >
          Abrir Central de Cobrança
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/30">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imóvel</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dias em atraso</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tenants.length > 0 ? (
              tenants.slice(0, 4).map((t) => {
                const daysOverdue = getDaysOverdue(t);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 rounded-lg border border-slate-100">
                          <AvatarImage src={getTenantAvatar(t.name)} />
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-[10px]">
                            {t.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {t.properties?.name || 'Sem imóvel'}
                    </td>
                    <td className="p-4">
                      <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-md">
                        {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs font-black text-slate-900">
                      R$ {t.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7 px-3 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs"
                        onClick={() => onCobrarClick(t.id)}
                      >
                        Cobrar
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs font-medium text-slate-400">
                  Nenhum inquilino em atraso no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};