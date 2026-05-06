import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Zap, 
  Droplets, 
  Percent, 
  FileText, 
  Edit2, 
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BillingModal } from '@/components/modals/BillingModal';

const mockBills = [
  { id: '1', property: 'Apto 101', type: 'energy', month: '06', year: 2024, totalValue: 145.20, calculatedValue: 145.20, status: 'pendente' },
  { id: '2', property: 'Casa 02', type: 'water', month: '06', year: 2024, totalValue: 80.00, calculatedValue: 80.00, status: 'pago' },
  { id: '3', property: 'Apto 101', type: 'iptu', month: '06', year: 2024, totalValue: 120.00, calculatedValue: 120.00, status: 'pago' },
  { id: '4', property: 'Kitnet A', type: 'energy', month: '05', year: 2024, totalValue: 95.00, calculatedValue: 95.00, status: 'atrasado' },
];

const Billing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (bill: any) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'iptu': return <Percent className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago': return <Badge className="bg-green-50 text-green-700 border-none">Pago</Badge>;
      case 'atrasado': return <Badge className="bg-red-50 text-red-700 border-none">Atrasado</Badge>;
      default: return <Badge className="bg-orange-50 text-orange-700 border-none">Pendente</Badge>;
    }
  };

  return (
    <DashboardLayout title="Gestão de Contas e Utilidades">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pendente</p>
              <h3 className="text-2xl font-bold text-gray-900">R$ 240,20</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pago este Mês</p>
              <h3 className="text-2xl font-bold text-gray-900">R$ 200,00</h3>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-12 px-6 shadow-lg" onClick={handleNew}>
            <Plus className="w-5 h-5" /> Novo Lançamento
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <CardTitle className="text-lg font-bold">Histórico de Lançamentos</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Buscar imóvel..." 
                className="pl-10 bg-gray-50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="bg-gray-50 border-none">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        bill.type === 'energy' ? 'bg-orange-50 text-orange-600' : 
                        bill.type === 'water' ? 'bg-blue-50 text-blue-600' : 
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {getIcon(bill.type)}
                      </div>
                      <span className="font-medium capitalize">{bill.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{bill.property}</TableCell>
                  <TableCell className="text-gray-500">{bill.month}/{bill.year}</TableCell>
                  <TableCell className="font-bold">R$ {bill.calculatedValue.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleEdit(bill)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BillingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        bill={selectedBill} 
      />
    </DashboardLayout>
  );
};

export default Billing;