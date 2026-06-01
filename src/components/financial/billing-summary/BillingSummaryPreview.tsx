"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Copy, Send, Mail } from 'lucide-react';

interface BillingSummaryPreviewProps {
  generatedMessage: string;
  sendMethod: 'whatsapp' | 'email';
  onSendMethodChange: (method: 'whatsapp' | 'email') => void;
  onSend: () => void;
  onCopy: () => void;
}

export const BillingSummaryPreview = ({
  generatedMessage,
  sendMethod,
  onSendMethodChange,
  onSend,
  onCopy
}: BillingSummaryPreviewProps) => {
  return (
    <div className="bg-slate-900 p-6 md:p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-400">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Preview da Cobrança</span>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => onSendMethodChange('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              sendMethod === 'whatsapp' ? 'bg-emerald-500 text-white' : 'text-slate-400'
            }`}
          >
            WhatsApp
          </button>
          <button 
            onClick={() => onSendMethodChange('email')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              sendMethod === 'email' ? 'bg-blue-500 text-white' : 'text-slate-400'
            }`}
          >
            E-mail
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-800/50 rounded-3xl p-5 text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed border border-slate-700/50 overflow-y-auto mb-6">
        {generatedMessage}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <Button 
          variant="ghost" 
          className="rounded-xl h-12 font-bold text-slate-400 hover:bg-slate-800 hover:text-white gap-2" 
          onClick={onCopy}
        >
          <Copy className="w-4 h-4" /> Copiar
        </Button>
        <Button 
          className={`rounded-xl h-12 font-bold gap-2 shadow-lg ${
            sendMethod === 'whatsapp' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`} 
          onClick={onSend}
        >
          {sendMethod === 'whatsapp' ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          Enviar por {sendMethod === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
        </Button>
      </div>
    </div>
  );
};