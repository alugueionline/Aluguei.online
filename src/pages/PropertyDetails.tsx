"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Receipt, 
  Edit2,
  Zap,
  Droplets,
  DollarSign,
  FileText,
  Bed,
  Bath,
  Car,
  Maximize,
  Building2,
  Loader2,
  History as HistoryIcon
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: tenant } = useQuery({
    queryKey: ['property-tenant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('property_id', id)
        .eq('status', 'ativo')
        .maybeSingle();
      
      if (error) return null;
      return data;
    },
    enabled: !!property
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Carregando detalhes do imóvel...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Imóvel não encontrado</h2>
          <Button onClick={() => navigate('/properties')} className="mt-4">Voltar para Lista</Button>
        </div>
      </DashboardLayout>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'energia': return <Zap className="w-3.5 h-3.5 text-orange-500" />;
      case 'agua': return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'aluguel': return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <FileText className="w-3.5 h-3.5 text-gray-500" />;
    }
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
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="h-48 bg-slate-100 relative">
              {property.image_url ? (
                <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Building2 className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-6 right-6">
                <Badge className={cn(
                  "border-none px-4 py-2 rounded-xl font-black text-xs uppercase shadow-lg",
                  property.status === 'alugado' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                )}>
                  {property.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-blue-100 text-blue-600 bg-blue-50/50 uppercase text-[10px] font-black px-2">
                      {property.type}
                    </Badge>
                    {property.condo_name && (
                      <Badge variant="outline" className="border-slate-100 text-slate-500 bg-slate-50/50 uppercase text-[10px] font-black px-2">
                        {property.condo_name}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{property.name}</h2>
                  <p className="flex items-center gap-2 text-slate-500 mt-2 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600" /> {property.address}
                  </p>
                </div>
                <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <Edit2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <DetailItem icon={<Bed className="w-4 h-4" />} label="Quartos" value={property.bedrooms} />
                <DetailItem icon={<Bath className="w-4 h-4" />} label="Banheiros" value={property.bathrooms} />
                <DetailItem icon={<Car className="w-4 h-4" />} label="Vagas" value={property.parking_spots} />
                <DetailItem icon={<Maximize className="w-4 h-4" />} label="Área" value={`${property.size_sqm}m²`} />
              </div>

              {property.description && (
                <div className="mt-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Descrição</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{property.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 mt-8 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Aluguel Base</p>
                  <p className="text-2xl font-black text-slate-900">R$ {Number(property.base_rent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                {property.unit_number && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Unidade</p>
                    <p className="text-lg font-bold text-slate-900">{property.unit_number} {property.floor ? `(${property.floor}º andar)` : ''}</p>
                  </div>
                )}
                {property.block && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Bloco / Torre</p>
                    <p className="text-lg font-bold text-slate-900">{property.block} {property.tower ? `/ ${property.tower}` : ''}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                <HistoryIcon className="w-5 h-5 text-blue-600" />
                Histórico de Cobranças
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Tipo</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Referência</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Valor</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest p-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="p-12 text-center text-slate-400 font-medium">
                      Nenhum histórico de cobrança registrado para este imóvel.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {tenant ? (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Inquilino Atual</p>
                    <h3 className="text-xl font-black tracking-tight">{tenant.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Telefone</span>
                    <span className="text-sm font-black">{tenant.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">E-mail</span>
                    <span className="text-sm font-black truncate max-w-[150px]">{tenant.email || 'N/A'}</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-white text-slate-900 hover:bg-blue-50 font-black rounded-2xl transition-all"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                >
                  Ver Perfil Completo
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-blue-50 border border-blue-100 p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-blue-900 tracking-tight mb-2">Sem Inquilino</h3>
              <p className="text-sm text-blue-700/70 font-medium mb-6">Este imóvel está disponível para locação no momento.</p>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-blue-200 bg-white text-blue-600 font-black hover:bg-blue-100 transition-all"
                onClick={() => navigate('/tenants')}
              >
                Vincular Inquilino
              </Button>
            </Card>
          )}

          <Card className="border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Resumo Financeiro (Ano)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Receita Total</span>
                <span className="font-black text-emerald-600">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Manutenção</span>
                <span className="font-black text-rose-600">R$ 0,00</span>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900">Lucro Líquido</span>
                  <span className="text-xl font-black text-blue-600">R$ 0,00</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
  <div className="flex flex-col items-center text-center gap-1">
    <div className="text-blue-600 mb-1">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black text-slate-900">{value || 0}</p>
  </div>
);

export default PropertyDetails;