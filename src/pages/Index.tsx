import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Activity,
  ChevronRight,
  Clock,
  FileWarning,
  ArrowUpDown,
  PieChart
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const cashFlowData = [
  { day: '01', entradas: 4000, saidas: 1200, lucro: 2800 },
  { day: '05', entradas: 5200, saidas: 1500, lucro: 3700 },
  { day: '10', entradas: 8500, saidas: 2100, lucro: 6400 },
  { day: '15', entradas: 9800, saidas: 2800, lucro: 7000 },
  { day: '20', entradas: 12400, saidas: 3100, lucro: 9300 },
  { day: '25', entradas: 14200, slashing: 3400, lucro: 10800 },
  { day: '30', entradas: 15420, saidas: 3150, lucro: 12270 },
];

const propertyPerformance = [
  { name: 'Ed. Central - Apto 101', revenue: 1200, expenses: 150, profit: 1050, status: 'positive' },
  { name: 'Res. Flores - Casa 02', revenue: 2500, expenses: 400, profit: 2100, status: 'positive' },
  { name: 'Kitnet A - Rua 10', revenue: 850, expenses: 100, profit: 750, status: 'positive' },
  { name: 'Ed. Central - Apto 202', revenue: 1300, expenses: 180, profit: 1120, status: 'positive' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Dashboard">
      {/* SEÇÃO 1 — RESUMO PRINCIPAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900 border border-slate-100">
                <TrendingUp className="w-6 h-6 stroke-[2.5px] text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold">
                +12.5%
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita do Mês</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">R$ 15.420,00</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900 border border-slate-100">
                <TrendingDown className="w-6 h-6 stroke-[2.5px] text-rose-500" />
              </div>
              <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-none font-bold">
                -2.4%
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Despesas do Mês</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">R$ 3.150,00</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-white/10 rounded-xl text-white">
                <DollarSign className="w-6 h-6 stroke-[2.5px] text-blue-400" />
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-none font-bold">
                79.5% Margem
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lucro Líquido</p>
            <h3 className="text-2xl md:text-3xl font-black mt-1">R$ 12.270,00</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900 border border-slate-100">
                <AlertCircle className="w-6 h-6 stroke-[2.5px] text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pendências</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor em Atraso</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">R$ 1.850,00</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
        {/* SEÇÃO 2 — GRÁFICO PRINCIPAL */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-lg md:text-xl font-black text-slate-900">Fluxo de Caixa</CardTitle>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Entradas vs Saídas acumuladas</p>
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button variant="outline" size="sm" className="text-[10px] md:text-xs font-bold h-8 border-slate-100">Mensal</Button>
              <Button variant="ghost" size="sm" className="text-[10px] md:text-xs font-bold text-slate-400 h-8">Trimestral</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[350px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}}
                  tickFormatter={(value) => `R$ ${value}`}
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorEntradas)" 
                  name="Entradas"
                />
                <Area 
                  type="monotone" 
                  dataKey="lucro" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorLucro)" 
                  name="Lucro Acumulado"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SEÇÃO 3 — ALERTAS IMPORTANTES */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
                <AlertCircle className="w-5 h-5 text-blue-600 stroke-[2.5px]" />
                Avisos e Pendências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alerta de Contrato a Vencer */}
              <div 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-all group"
                onClick={() => navigate('/tenants/1')}
              >
                <div className="p-2.5 bg-white rounded-xl text-slate-900 shadow-sm group-hover:text-blue-600">
                  <FileWarning className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">Contrato a Vencer</p>
                  <p className="text-xs text-slate-500 font-bold">João Silva • Vence em 30 dias</p>
                  <p className="text-[10px] font-black text-blue-600 mt-1.5 uppercase tracking-widest">Apto 101</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors self-center" />
              </div>

              <div 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 cursor-pointer hover:bg-rose-50 hover:border-rose-100 transition-all group"
                onClick={() => navigate('/financial')}
              >
                <div className="p-2.5 bg-white rounded-xl text-slate-900 shadow-sm group-hover:text-rose-600">
                  <Clock className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">Pedro Santos</p>
                  <p className="text-xs text-slate-500 font-bold">Kitnet A • 5 dias de atraso</p>
                  <p className="text-sm font-black text-rose-600 mt-1.5">R$ 900,00</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-600 transition-colors self-center" />
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 5 — MÉTRICAS INTELIGENTES */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desempenho</p>
              <h4 className="text-xl font-black text-slate-900 mt-1">94.8%</h4>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '94.8%' }}></div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio</p>
              <h4 className="text-xl font-black text-slate-900 mt-1">R$ 1.450</h4>
              <p className="text-[10px] text-emerald-600 font-black mt-1.5">+3% vs mês ant.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* SEÇÃO 4 — PERFORMANCE POR IMÓVEL */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black text-slate-900">Ranking de Lucratividade</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {propertyPerformance.map((prop, i) => (
                <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{prop.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-emerald-500 stroke-[3px]" /> R$ {prop.revenue}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-rose-500 stroke-[3px]" /> R$ {prop.expenses}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">R$ {prop.profit}</p>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-black h-5 px-2">
                      {((prop.profit / prop.revenue) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 6 — ATIVIDADE RECENTE */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black text-slate-900">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { user: 'João Silva', action: 'Pagamento recebido', time: 'Há 2 horas', amount: 'R$ 1.200,00', type: 'success' },
              { user: 'Sistema', action: 'Nova cobrança gerada', time: 'Há 5 horas', amount: 'R$ 145,20', type: 'info' },
              { user: 'Maria Oliveira', action: 'Pagamento recebido', time: 'Ontem', amount: 'R$ 2.500,00', type: 'success' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 2 && <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-50"></div>}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  activity.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {activity.type === 'success' ? <DollarSign className="w-5 h-5 stroke-[2.5px]" /> : <Activity className="w-5 h-5 stroke-[2.5px]" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-black text-slate-900">{activity.user}</p>
                    <span className="text-[10px] font-bold text-slate-400">{activity.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{activity.action}</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{activity.amount}</p>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-black"
              onClick={() => navigate('/financial')}
            >
              Ver todo o histórico
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;