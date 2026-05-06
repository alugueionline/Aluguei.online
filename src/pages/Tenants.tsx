import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, MoreHorizontal } from 'lucide-react';

const mockTenants = [
  { id: '1', name: 'João Silva', property: 'Apto 101', entryDate: '10/01/2024', rent: 1200, status: 'ativo' },
  { id: '2', name: 'Maria Oliveira', property: 'Casa 02', entryDate: '15/03/2024', rent: 2500, status: 'ativo' },
  { id: '3', name: 'Pedro Santos', property: 'Kitnet A', entryDate: '05/05/2024', rent: 850, status: 'pendente' },
];

const Tenants = () => {
  return (
    <DashboardLayout title="Inquilinos">
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" /> Novo Inquilino
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold">Inquilino</TableHead>
                <TableHead className="font-semibold">Imóvel</TableHead>
                <TableHead className="font-semibold">Data Entrada</TableHead>
                <TableHead className="font-semibold">Valor Aluguel</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTenants.map((tenant) => (
                <TableRow key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.name}`} />
                        <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">CPF: ***.***.***-**</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">{tenant.property}</TableCell>
                  <TableCell className="text-gray-500">{tenant.entryDate}</TableCell>
                  <TableCell className="font-bold">R$ {tenant.rent.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === 'ativo' ? 'secondary' : 'outline'} className={tenant.status === 'ativo' ? 'bg-green-50 text-green-700 border-none' : ''}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
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

export default Tenants;