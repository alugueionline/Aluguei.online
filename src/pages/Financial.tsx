import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock,
  Filter,
  Download
} from 'lucide-react';

const payments = [
  { id: '1', tenant: 'João Silva', property: 'Apto 101', type: 'Aluguel + Luz', value: 1345.20, dueDate: '10/06/2024', status: 'pago' },
  { id: '2', tenant: 'Maria Oliveira', property: 'Casa 02', type: 'Aluguel', value: 2500.00, dueDate: '15/06/2024', status: 'pendente' },
  { id: '3', tenant: 'Pedro Santos', property: 'Kitnet A', type: 'Aluguel + Água', value: 900.00, dueDate: '05/06/2024', status: 'atrasado' },
];

const Financial = () => {
  return (
    <DashboardLayout title="Financeiro">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-green-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl text-white">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Recebido (Mês)</p>
              <h3 className="text-2xl font-bold text-green-900">R$ 12.450,00</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-orange-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-xl text-white">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Pendente</p>
              <h3 className="text-2xl font-bold text-orange-900">R$ 3.200,00</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-xl text-white">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Atrasado</p>
              <h3 className="text-2xl font-bold text-red-900">R$ 850,00</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Fluxo de Pagamentos</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquilino / Imóvel</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{p.tenant}</p>
                    <p className="text-xs text-gray-500">{p.property}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{p.type}</TableCell>
                  <TableCell className="text-sm text-gray-600">{p.dueDate}</TableCell>
                  <TableCell className="font-bold">R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={p.status === 'pago' ? 'secondary' : 'outline'}
                      className={
                        p.status === 'pago' ? 'bg-green-100 text-green-700 border-none' :
                        p.status === 'atrasado' ? 'bg-red-100 text-red-700 border-none' :
                        'bg-orange-100 text-orange-700 border-none'
                      }
                    >
                      {p.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      Confirmar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Financial;