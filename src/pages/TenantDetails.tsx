import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Home,
  CreditCard,
  History
} from 'lucide-react';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock de dados do inquilino
  const tenant = {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    phone: '(11) 98888-7777',
    property: 'Apto 101 - Edifício Central',
    entryDate: '10/01/2024',
    rentValue: 1200.00,
    status: 'ativo',
    documents: [
      { name: 'Contrato de Locação.pdf', date: '10/01/2024' },
      { name: 'RG_CPF_Frente.jpg', date: '08/01/2024' }
    ]
  };

  return (
    <DashboardLayout title="Perfil do Inquilino">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2 text-gray-500 hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-32 bg-blue-600" />
            <CardContent className="relative pt-0">
              <div className="absolute -top-12 left-6">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-12 h-12" />
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                <Badge className="mt-2 bg-green-50 text-green-700 border-none uppercase text-[10px]">
                  {tenant.status}
                </Badge>
              </div>
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{tenant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">CPF: {tenant.cpf}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-[10px] text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Imóvel Atual</p>
                  <p className="text-lg font-bold text-gray-900">{tenant.property}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Data de Entrada</p>
                  <p className="text-lg font-bold text-gray-900">{tenant.entryDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { ref: '06/2024', type: 'Aluguel', value: 1200, status: 'pago' },
                  { ref: '06/2024', type: 'Energia', value: 145.20, status: 'pago' },
                  { ref: '05/2024', type: 'Aluguel', value: 1200, status: 'pago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
                    <div>
                      <p className="font-bold text-gray-900">{item.type}</p>
                      <p className="text-xs text-gray-500">Referência: {item.ref}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">R$ {item.value.toFixed(2)}</p>
                      <Badge className="bg-green-50 text-green-700 border-none text-[10px]">PAGO</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TenantDetails;