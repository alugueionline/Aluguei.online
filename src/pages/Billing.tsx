"use client";

import React, { useState, useEffect } from 'react';
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
  Clock,
  DollarSign,
  Loader2
} from 'lucide-react';
import { BillingModal } from '@/components/modals/BillingModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Billing = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*, properties(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBills(data || []);
    } catch (err: any) {
      showError('Erro ao carregar lançamentos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleEdit = (bill: any) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este lançamento?')) {
      try {
        const { error } = await supabase.from('bills').delete().eq('id', id);
        if (error) throw error;
        showSuccess('Lançamento removido.');
        fetchBills();
      } catch (err: any) {
        showError('Erro ao excluir: ' + err.message);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'energia': return <Zap className="w-4 h-4" />;
      case 'agua': return <Droplets className="w-4 h-4" />;
      case 'iptu': return <Percent className="w-4 h-4" />;
      case 'aluguel': return <DollarSign className="w-4 h-4" />;
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

  const filteredBills = bills.filter(bill => 
    (bill.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendente = bills
    .filter(b => b.status !== 'pago')
    .reduce((acc, b) => acc + Number(b.calculated_value || b.total_value), 0);

  const totalPago = bills
    .filter(b => b.status === 'pago')
    .reduce((acc, b) => acc + Number(b.calculated_value || b.total_value), 0);

  return (
    <DashboardLayout title="Contas e Utilidades">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pendente</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
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
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-12 px-6 shadow-lg w-full sm:w-auto" onClick={handleNew}>
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
            <Button variant="outline" size="icon" className="bg-gray-50 border-none shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-400 mt-4">Carregando lançamentos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="min-w-[150px]">Tipo</TableHead>
                    <TableHead className="min-w-[120px]">Imóvel</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            bill.type === 'energia' ? 'bg-orange-50 text-orange-600' : 
                            bill.type === 'agua' ? 'bg-blue-50 text-blue-600' : 
                            bill.type === 'aluguel' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-purple-50 text-purple-600'
                          )}>
                            {getIcon(bill.type)}
                          </div>
                          <span className="font-medium capitalize text-sm">{bill.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 text-sm">{bill.properties?.name || 'N/A'}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{bill.month}/{bill.year}</TableCell>
                      <TableCell className="font-bold text-sm">R$ {Number(bill.calculated_value || bill.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(bill.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBills.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-10 text-center text-gray-400">
                        Nenhum lançamento encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BillingModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchBills(); }} 
        onSave={fetchBills}
        bill={selectedBill} 
      />
    </DashboardLayout>
  );
};

export default Billing;