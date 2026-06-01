"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TenantPropertiesListProps {
  activeContracts: any[];
}

export const TenantPropertiesList = ({ activeContracts }: TenantPropertiesListProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-600" /> Imóveis Locados ({activeContracts.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeContracts.map((contract: any) => (
          <Card key={contract.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 truncate">{contract.properties?.name}</h4>
                <Badge variant="outline" className="text-[8px] font-black uppercase border-blue-100 text-blue-600">
                  Vencimento: Dia {contract.due_day || '5'}
                </Badge>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Aluguel</p>
                  <p className="text-sm font-black text-blue-600">
                    R$ {Number(contract.rent_value).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600" 
                  onClick={() => navigate(`/properties/${contract.properties?.id || contract.property_id}`)}
                >
                  Ver Imóvel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};