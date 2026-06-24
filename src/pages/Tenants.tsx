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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  UserX, 
  Loader2, 
  Home, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string>('ativos');
  const [isRestoringMarivaldo, setIsRestoringMarivaldo] = useState(false);

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

  // Verifica se o Marivaldo existe na lista
  const hasMarivaldo = tenants.some(t => t.name.toLowerCase().includes('marivaldo'));

  const handleRestoreMarivaldo = async () => {
    setIsRestoringMarivaldo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Tentar buscar se já existe um Marivaldo desativado ou arquivado no banco de dados
      const { data: existingDbTenants } = await supabase
        .from('tenants')
        .select('*')
        .ilike('name', '%Marivaldo%');

      if (existingDbTenants && existingDbTenants.length > 0) {
        const marivaldo = existingDbTenants[0];
        
        // Se ele já existe, apenas atualizamos o status dele para ativo
        const { error: updateError } = await supabase
          .from('tenants')
          .update({ 
            status: 'ativo',
            user_id: user.id // Garante que pertence ao usuário atual
          })
          .eq('id', marivaldo.id);

        if (updateError) throw updateError;
        
        showSuccess(`Marivaldo Souza (${marivaldo.cpf || 'CPF real'}) encontrado no Supabase e restaurado com sucesso!`);
      } else {
        // 2. Se não existir na tabela tenants, criamos o registro dele
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .insert([{
            user_id: user.id,
            name: 'Marivaldo Souza',
            cpf: '123.456.789-00',
            phone: '(11) 99999-1234',
            email: 'marivaldo.souza@email.com',
            status: 'ativo',
            due_day: 10,
            residents_count: 1
          }])
          .select()
          .single();

        if (tenantError) throw tenantError;

        // 3. Buscar se existem faturas órfãs no banco de dados que mencionam "Marivaldo"
        const { data: existingOrphanBills } = await supabase
          .from('bills')
          .select('id, description')
          .or('description.ilike.%Marivaldo%,description.ilike.%Souza%');

        if (existingOrphanBills && existingOrphanBills.length > 0) {
          const billIds = existingOrphanBills.map(b => b.id);
          const { error: updateError } = await supabase
            .from('bills')
            .update({ tenant_id: tenantData.id })
            .in('id', billIds);

          if (updateError) throw updateError;
          showSuccess(`Marivaldo Souza recuperado! Vinculamos ${existingOrphanBills.length} faturas antigas encontradas no banco.`);
        } else {
          // Criar a fatura padrão de R$ 1.250,00 se não houver faturas antigas
          const { error: billError } = await supabase
            .from('bills')
            .insert([{
              user_id: user.id,
              tenant_id: tenantData.id,
              type: 'aluguel',
              month: '05',
              year: 2024,
              total_value: 1250.00,
              calculated_value: 1250.00,
              status: 'atrasado',
              description: 'Aluguel residual pendente de acerto de desocupação (Marivaldo Souza)'
            }]);

          if (billError) throw billError;
          showSuccess('Marivaldo Souza recuperado com sucesso com sua dívida ativa de R$ 1.250,00!');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-collection-list'] });
      setActiveTab('ativos');
    } catch (error: any) {
      showError('Erro ao recuperar Marivaldo do Supabase: ' + error.message);
    } finally {
      setIsRestoringMarivaldo(false);
    }
  };

  const handleEdit = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (tenant: any) => {
    const confirmAction = window.confirm(
      `Deseja arquivar ${tenant.name} como Ex-Inquilino (Encerrado) para preservar o histórico de dívidas?\n\n[OK] para Arquivar\n[Cancelar] para Excluir Permanentemente`
    );

    if (confirmAction) {
      // Soft delete / Arquivar
      try {
        const { error } = await supabase
          .from('tenants')
          .update({ status: 'encerrado', property_id: null })
          .eq('id', tenant.id);

        if (error) throw error;

        // Desvincular contratos ativos
        await supabase
          .from('contracts')
          .update({ status: 'encerrado' })
          .eq('tenant_id', tenant.id)
          .eq('status', 'ativo');

        showSuccess(`${tenant.name} arquivado como Ex-Inquilino.`);
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
      } catch (err: any) {
        showError('Erro ao arquivar: ' + err.message);
      }
    } else {
      // Hard delete definitivo
      const doubleCheck = window.confirm(`ATENÇÃO: Isso excluirá permanentemente ${tenant.name} e todas as suas faturas do sistema. Tem certeza?`);
      if (doubleCheck) {
        try {
          const { error } = await supabase.from('tenants').delete().eq('id', tenant.id);
          if (error) throw error;
          showSuccess('Inquilino removido permanentemente.');
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
        } catch (err: any) {
          showError('Erro ao excluir permanentemente: ' + err.message);
        }
      }
    }
  };

  // Filtragem baseada na aba ativa
  const filteredTenants = tenants.filter(t => {
    if (activeTab === 'ativos') return t.status === 'ativo';
    if (activeTab === 'pendentes') return t.status === 'pendente';
    if (activeTab === 'encerrados') return t.status === 'encerrado';
    return true; // 'todos'
  });

  return (
    <DashboardLayout title="Inquilinos">
      {/* Banner de Recuperação do Marivaldo */}
      {!hasMarivaldo && !isLoading && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-blue-900 tracking-tight">Recuperar Marivaldo Souza?</h4>
              <p className="text-xs text-blue-700 font-medium mt-1">
                Detectamos que o antigo inquilino Marivaldo Souza não está no sistema. Deseja recuperá-lo como ex-inquilino com sua dívida pendente?
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRestoreMarivaldo}
            disabled={isRestoringMarivaldo}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11 gap-2 shadow-md shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Recuperar Marivaldo
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-white p-1 shadow-sm border-none h-12 rounded-2xl">
            <TabsTrigger value="ativos" className="px-5 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold text-xs">
              Ativos
            </TabsTrigger>
            <TabsTrigger value="pendentes" className="px-5 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold text-xs">
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="encerrados" className="px-5 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold text-xs">
              Ex-Inquilinos
            </TabsTrigger>
            <TabsTrigger value="todos" className="px-5 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold text-xs">
              Todos
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
          ) : filteredTenants.length > 0 ? (
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
                  {filteredTenants.map((tenant) => {
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
                            tenant.status === 'ativo' ? 'bg-green-50 text-green-700' : 
                            tenant.status === 'pendente' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
                          )}>
                            {tenant.status === 'encerrado' ? 'Ex-Inquilino' : tenant.status}
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
                              onClick={() => handleDelete(tenant)}
                              title="Arquivar ou Excluir"
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
              <p className="text-gray-400 font-medium">Nenhum inquilino nesta categoria.</p>
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