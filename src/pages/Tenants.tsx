import React, { useState } from 'react';
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
import { Plus, Phone, Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { TenantModal } from '@/components/modals/TenantModal';

const mockTenants = [
  { id: '1', name: 'João Silva', property: 'Apto 101', entryDate: '2024-01-10', rent: 1200, status: 'ativo', cpf: '123.456.789-00', phone: '(11) 98888-7777' },
  { id: '2', name: 'Maria Oliveira', property: 'Casa 02', entryDate: '2024-03-15', rent: 2500, status: 'ativo', cpf: '987.654.321-11', phone: '(11) 97777-6666' },
  { id: '3', name: 'Pedro Santos', property: 'Kitnet A', entryDate: '2024-05-05', rent: 850, status: 'pendente', cpf: '456.789.123-22', phone: '(11) 96666-5555' },
];

const Tenants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const handleEdit = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Inquilinos">
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md" onClick={handleNew}>
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
                <TableHead className="text-right">Ações</TableHead>
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
                        <p className="text-xs text-gray-500">{tenant.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">{tenant.property}</TableCell>
                  <TableCell className="text-gray-500">{new Date(tenant.entryDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-bold">R$ {tenant.rent.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === 'ativo' ? 'secondary' : 'outline'} className={tenant.status === 'ativo' ? 'bg-green-50 text-green-700 border-none' : ''}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleEdit(tenant)}
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

      <TenantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tenant={selectedTenant} 
      />
    </DashboardLayout>
  );
};

export default Tenants;