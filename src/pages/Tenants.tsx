"use client";

import React, { useState, useEffect } from 'react';
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
import { Plus, Edit2, Trash2, ExternalLink, UserX } from 'lucide-react';
import { TenantModal } from '@/components/modals/TenantModal';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const Tenants = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          properties (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTenants(data || []);
    } catch (error: any) {
      showError('Erro ao carregar inquilinos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

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
        fetchTenants();
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
          {loading ? (
            <div className="p-20 text-center text-gray-400">Carregando inquilinos...</div>
          ) : tenants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Inquilino</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Imóvel</TableHead>
                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Status</TableHead>
                    <TableHead className="text-right font-bold text-gray-400 uppercase text-[10px] tracking-widest p-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                      <TableCell className="p-6">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/tenants/${tenant.id}`)}
                        >
                          <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm group-hover:border-blue-200 transition-all">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.name}`} />
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
                        <span className="font-bold text-blue-600 text-sm">
                          {tenant.properties?.name || 'Não vinculado'}
                        </span>
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
                  ))}
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
        onClose={() => { setIsModalOpen(false); fetchTenants(); }} 
        tenant={selectedTenant} 
      />
    </DashboardLayout>
  );
};

export default Tenants;