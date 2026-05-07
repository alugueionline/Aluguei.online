"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  MapPin, 
  ArrowUpRight,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Building2,
  Loader2
} from 'lucide-react';
import { PropertyModal } from '@/components/modals/PropertyModal';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

const Properties = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error && error.code !== '42P01') throw error;
      return data || [];
    }
  });

  const handleEdit = (property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProperty(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) showError('Erro ao excluir imóvel');
      else {
        showSuccess('Imóvel removido com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['properties'] });
      }
    }
  };

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Meus Imóveis">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="relative w-full md:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar nos meus imóveis..." 
            className="pl-12 bg-white border-none premium-shadow h-14 rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-[#2563FF] hover:bg-[#1d4ed8] h-14 px-8 rounded-2xl gap-2 font-bold shadow-lg" onClick={handleNew}>
          <Plus className="w-5 h-5" /> Novo Imóvel
        </Button>
      </div>

      {isLoading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-400 font-medium">Carregando seu workspace...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="premium-card rounded-[2rem] overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative h-56 bg-gray-100">
                  {property.image_url ? (
                    <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-14 h-14" />
                    </div>
                  )}
                  <div className="absolute top-5 right-5">
                    <Badge className={cn(
                      "border-none px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase",
                      property.status === 'alugado' ? 'bg-emerald-500 text-white' : 'bg-[#2563FF] text-white'
                    )}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">{property.name}</h3>
                  <div className="flex items-start gap-3 mb-6 text-gray-500">
                    <MapPin className="w-4 h-4 mt-0.5 text-[#2563FF]" />
                    <p className="text-sm font-medium line-clamp-1">{property.address}</p>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Aluguel Base</p>
                      <p className="text-xl font-bold text-gray-900">R$ {Number(property.base_rent).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 text-red-500" onClick={() => handleDelete(property.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-50 text-blue-600" onClick={() => handleEdit(property)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl bg-gray-50" onClick={() => navigate(`/properties/${property.id}`)}>
                        <ArrowUpRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
            <Building2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum imóvel cadastrado</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">Comece adicionando seu primeiro imóvel para gerenciar aluguéis e inquilinos.</p>
          <Button onClick={handleNew} className="bg-[#2563FF] hover:bg-blue-700 rounded-2xl h-12 px-8 font-bold">
            Cadastrar Primeiro Imóvel
          </Button>
        </div>
      )}

      <PropertyModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['properties'] }); }} 
        property={selectedProperty} 
      />
    </DashboardLayout>
  );
};

export default Properties;