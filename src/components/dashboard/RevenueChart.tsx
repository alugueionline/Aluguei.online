"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{ month: string; value: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">Evolução dos Recebimentos</CardTitle>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Histórico de receitas confirmadas nos últimos 12 meses</p>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563FF" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
                tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', padding: '10px' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Recebido']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563FF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};