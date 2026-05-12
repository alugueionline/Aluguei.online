"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Edit2, Trash2, ExternalLink, UserX, Loader2, Home } from 'lucide-react';
import { TenantModal } from '@/components/modals/TenantModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTenantAvatar } from '@/utils/avatar';

const Tenants = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          properties (name),
          contracts (
            id, 
            status,
            properties (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error && error.code !== '42P01') throw error;
      return data || [];
    }
  });

  const handleEdit = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja remover este inquilino do seu workspace?')) {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) showError('Erro ao excluir');
      else {
        showSuccess('Inquilino removido.');
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
      }
    }
  };

  return (
    <DashboardLayout title="Inquilinos">
      <div className="flex justify-end mb-6 md:mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md w-full md:w-auto h-12 rounded-2xl font-bold" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo Inquilino
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-400 font-medium">Carregando inquilinos...</p>
            </div>
          ) : tenants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Inquilino</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Imóvel / Gestão</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Status</TableHead>
                    <TableHead className="text-right font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => {
                    const activeContracts = tenant.contracts?.filter((c: any) => c.status === 'ativo') || [];
                    const contractCount = activeContracts.length;
                    const propertyName = contractCount > 0 
                      ? activeContracts[0].properties?.name 
                      : tenant.properties?.name;
                    
                    return (
                      <TableRow key={tenant.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                        <TableCell className="p-6">
                          <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate(`/tenants/${tenant.id}`)}
                          >
                            <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm group-hover:border-blue-200 transition-all">
                              <AvatarImage src={getTenantAvatar(tenant.name)} />
                              <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                {tenant.name}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </p>
                              <p className="text-xs text-gray-500 font-medium">{tenant.phone || 'Sem telefone'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          {contractCount > 1 ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">
                                {contractCount} IMÓVEIS
                              </Badge>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Gestor / Master</span>
                            </div>
                          ) : propertyName ? (
                            <div className="flex items-center gap-2">
                              <Home className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-bold text-blue-600 text-sm">
                                {propertyName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">Sem contrato ativo</span>
                          )}
                        </TableCell>
                        <TableCell className="p-6">
                          <Badge className={cn(
                            "border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase",
                            tenant.status === 'ativo' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                          )}>
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleEdit(tenant)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(tenant.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                <UserX className="w-8 h-8" />
              </div>
              <p className="text-gray-400 font-medium">Nenhum inquilino cadastrado no seu workspace.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TenantModal 
        isOpen={isModalOpen} 
        onClose={() => { 
          setIsModalOpen(false); 
          queryClient.invalidateQueries({ queryKey: ['tenants'] }); 
        }} 
        tenant={selectedTenant} 
      />
    </DashboardLayout>
  );
};

export default Tenants;