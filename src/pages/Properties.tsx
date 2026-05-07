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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="relative w-full md:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2563FF] transition-colors" />
          <Input 
            placeholder="Buscar por nome ou endereço..." 
            className="pl-12 bg-white border-none premium-shadow h-14 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2563FF]/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="bg-white border-none premium-shadow h-14 px-6 rounded-2xl gap-2 font-bold text-gray-600 hover:text-gray-900">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Button className="bg-[#2563FF] hover:bg-[#1d4ed8] h-14 px-8 rounded-2xl gap-2 font-bold shadow-lg shadow-blue-200 flex-1 md:flex-none" onClick={handleNew}>
            <Plus className="w-5 h-5" /> Novo Imóvel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProperties.map((property) => (
          <Card key={property.id} className="premium-card rounded-[2rem] overflow-hidden group">
            <CardContent className="p-0">
              <div className="relative h-56 bg-gray-100">
                {property.imageUrl ? (
                  <img 
                    src={property.imageUrl} 
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-14 h-14" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute top-5 right-5">
                  <Badge className={cn(
                    "border-none px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg",
                    property.status === 'alugado' ? 'bg-emerald-500 text-white' : 
                    property.status === 'disponivel' ? 'bg-[#2563FF] text-white' : 'bg-orange-500 text-white'
                  )}>
                    {property.status}
                  </Badge>
                </div>
                <div className="absolute bottom-5 left-6 text-white">
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] mb-1">{property.type}</p>
                  <h3 className="text-xl font-bold tracking-tight">{property.name}</h3>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-3 mb-6 text-gray-500">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#2563FF]" />
                  <p className="text-sm font-medium line-clamp-1">{property.address}</p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Aluguel Base</p>
                    <p className="text-xl font-bold text-gray-900 tracking-tight">R$ {property.baseRent.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-11 w-11 rounded-xl hover:bg-blue-50 hover:text-[#2563FF] transition-all"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-11 w-11 rounded-xl bg-gray-50 hover:bg-[#2563FF] hover:text-white transition-all"
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