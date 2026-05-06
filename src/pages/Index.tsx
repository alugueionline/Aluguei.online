import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Home, 
  Users, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', receita: 4500 },
  { name: 'Fev', receita: 5200 },
  { name: 'Mar', receita: 4800 },
  { name: 'Abr', receita: 6100 },
  { name: 'Mai', receita: 5900 },
  { name: 'Jun', receita: 7200 },
];

const stats = [
  { label: 'Total de Imóveis', value: '24', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Inquilinos Ativos', value: '18', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Receita Mensal', value: 'R$ 12.450', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Pendências', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

const Index = () => {
  return (
    <DashboardLayout title="Visão Geral">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  +12% <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ocupação por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { type: 'Casas', ocupados: 8, total: 10 },
                { type: 'Aptos', ocupados: 12, total: 15 },
                { type: 'Kitnets', ocupados: 5, total: 8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ocupados" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;