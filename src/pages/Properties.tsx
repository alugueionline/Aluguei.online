import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpRight,
  Edit2,
  Image as ImageIcon
} from 'lucide-react';
import { Property } from '@/types/rental';
import { PropertyModal } from '@/components/modals/PropertyModal';

const mockProperties: Property[] = [
  { id: '1', name: 'Apto 101', type: 'apartamento', address: 'Rua Central, 123', baseRent: 1200, status: 'alugado', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80' },
  { id: '2', name: 'Casa 02', type: 'casa', address: 'Av. das Flores, 45', baseRent: 2500, status: 'disponivel', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80' },
  { id: '3', name: 'Kitnet A', type: 'kitnet', address: 'Rua 10, 500', baseRent: 850, status: 'alugado', imageUrl: 'https://images.unsplash.com/photo-1536376074432-c26412749023?w=500&q=80' },
  { id: '4', name: 'Apto 202', type: 'apartamento', address: 'Rua Central, 123', baseRent: 1300, status: 'manutencao', imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80' },
];

const Properties = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProperty(null);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Imóveis">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar por nome ou endereço..." 
            className="pl-10 bg-white border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="bg-white border-none shadow-sm gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 flex-1 md:flex-none" onClick={handleNew}>
            <Plus className="w-4 h-4" /> Novo Imóvel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <Card key={property.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-48 bg-gray-200">
                {property.imageUrl ? (
                  <img 
                    src={property.imageUrl} 
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge className={
                    property.status === 'alugado' ? 'bg-green-500' : 
                    property.status === 'disponivel' ? 'bg-blue-500' : 'bg-orange-500'
                  }>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{property.type}</p>
                  <h3 className="text-lg font-bold">{property.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-2 mb-4 text-gray-500">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm line-clamp-1">{property.address}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Aluguel Base</p>
                    <p className="text-lg font-bold text-gray-900">R$ {property.baseRent.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        property={selectedProperty} 
      />
    </DashboardLayout>
  );
};

export default Properties;