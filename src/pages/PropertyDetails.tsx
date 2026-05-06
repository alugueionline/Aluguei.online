import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Receipt, 
  TrendingUp, 
  Calendar,
  Zap,
  Droplets,
  Edit2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock de dados para o exemplo
  const property = {
    id: '1',
    name: 'Apto 101 - Edifício Central',
    address: 'Rua Principal, 100, Centro',
    type: 'Apartamento',
    status: 'alugado',
    baseRent: 1200,
    tenant: {
      name: 'João Silva',
      phone: '(11) 98888-7777',
      entryDate: '10/01/2024'
    },
    history: [
      { id: '1', type: 'energy', month: '06/2024', value: 145.20, status: 'pago' },
      { id: '2', type: 'water', month: '06/2024', value: 80.00, status: 'pago' },
      { id: '3', type: 'rent', month: '06/2024', value: 1200.00, status: 'pago' },
    ]
  };

  return (
    <DashboardLayout title="Detalhes do Imóvel">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2 text-gray-500 hover:text-gray-900"
        onClick={() => navigate('/properties')}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Lista
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Info Principal */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Badge className="mb-2 bg-blue-50 text-blue-600 border-none uppercase text-[10px]">
                    {property.type}
                  </Badge>
                  <h2 className="text-3xl font-bold text-gray-900">{property.name}</h2>
                  <p className="flex items-center gap-2 text-gray-500 mt-2">
                    <MapPin className="w-4 h-4" /> {property.address}
                  </p>
                </div>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Aluguel Base</p>
                  <p className="text-xl font-bold text-gray-900">R$ {property.baseRent.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                  <Badge className="mt-1 bg-green-50 text-green-700 border-none">
                    {property.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Último Reajuste</p>
                  <p className="text-sm font-medium text-gray-900">Jan/2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Histórico de Cobranças
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize font-medium">{item.type}</TableCell>
                      <TableCell>{item.month}</TableCell>
                      <TableCell className="font-bold">R$ {item.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-50 text-green-700 border-none">PAGO</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Inquilino e Widgets */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Inquilino Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-blue-200 font-bold uppercase">Nome</p>
                  <p className="text-lg font-bold">{property.tenant.name}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 font-bold uppercase">Contato</p>
                  <p className="text-sm">{property.tenant.phone}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-blue-200 font-bold uppercase">Data de Entrada</p>
                  <p className="text-sm">{property.tenant.entryDate}</p>
                </div>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold">
                  Ver Perfil Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">Desempenho Anual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receita Total</span>
                <span className="font-bold text-emerald-600">R$ 7.200,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Manutenção</span>
                <span className="font-bold text-rose-600">R$ 450,00</span>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Lucro Líquido</span>
                  <span className="text-lg font-bold text-blue-600">R$ 6.750,00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyDetails;