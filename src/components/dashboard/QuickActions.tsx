"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Home, Plus, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

export const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  return (
    <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-1">Ações rápidas</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Atalhos operacionais</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onNavigate('/contracts')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Novo contrato</span>
        </button>

        <button 
          onClick={() => onNavigate('/properties')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Novo imóvel</span>
        </button>

        <button 
          onClick={() => onNavigate('/financial')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Nova cobrança</span>
        </button>

        <button 
          onClick={() => onNavigate('/tenants')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/10 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Cadastrar inquilino</span>
        </button>
      </div>
    </Card>
  );
};