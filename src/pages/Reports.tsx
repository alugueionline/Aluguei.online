import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileDown,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';

const profitData = [
  { name: 'Apto 101', receita: 1200, custos: 150 },
  { name: 'Casa 02', receita: 2500, custos: 400 },
  { name: 'Kitnet A', receita: 850, custos: 100 },
  { name: 'Apto 202', receita: 1300, custos: 180 },
];

const COLORS = ['#2563eb', '#f97316', '#10b981', '#8b5cf6'];

const Reports = () => {
  return (
    <DashboardLayout title="Relatórios e Análises">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Últimos 6 meses</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lucro Líquido por Imóvel</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={100} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="receita" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} name="Receita Bruta" />
                <Bar dataKey="custos" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} name="Custos/Taxas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receita Total</span>
                <span className="font-bold text-gray-900">R$ 5.850,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custos Totais</span>
                <span className="font-bold text-red-600">- R$ 830,00</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Lucro Líquido</span>
                <span className="text-xl font-bold text-green-600">R$ 5.020,00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-600 text-white">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
              <h4 className="text-lg font-bold mb-1">Crescimento de 15%</h4>
              <p className="text-sm text-blue-100">Em comparação ao mês anterior, sua receita líquida aumentou significativamente.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;