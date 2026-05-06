import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, Plus, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { CondoModal } from '@/components/modals/CondoModal';

const mockCondos = [
  { id: '1', name: 'Edifício Central', address: 'Rua Principal, 100', units: 12, fee: 350 },
  { id: '2', name: 'Residencial Flores', address: 'Av. das Palmeiras, 45', units: 8, fee: 280 },
];

const Condos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<any>(null);

  const handleEdit = (condo: any) => {
    setSelectedCondo(condo);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedCondo(null);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Condomínios">
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo Condomínio
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockCondos.map((condo) => (
          <Card key={condo.id} className="border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{condo.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" /> {condo.address}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-3.5 h-3.5" /> {condo.units} Unidades
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Taxa Mensal</p>
                  <p className="text-lg font-bold text-gray-900">R$ {condo.fee}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleEdit(condo)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CondoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        condo={selectedCondo} 
      />
    </DashboardLayout>
  );
};

export default Condos;