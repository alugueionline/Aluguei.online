import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Plus, ChevronRight } from 'lucide-react';

const mockCondos = [
  { id: '1', name: 'Edifício Central', address: 'Rua Principal, 100', units: 12, fee: 350 },
  { id: '2', name: 'Residencial Flores', address: 'Av. das Palmeiras, 45', units: 8, fee: 280 },
];

const Condos = () => {
  return (
    <DashboardLayout title="Condomínios">
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" /> Novo Condomínio
        </Button>
      </div>

      <div className="space-y-4">
        {mockCondos.map((condo) => (
          <Card key={condo.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group">
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
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Taxa Mensal</p>
                  <p className="text-lg font-bold text-gray-900">R$ {condo.fee}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Condos;