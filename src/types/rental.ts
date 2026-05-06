export type PropertyType = 'casa' | 'apartamento' | 'kitnet';
export type PropertyStatus = 'disponivel' | 'alugado' | 'manutencao';
export type BillingType = 'fixed' | 'per_person' | 'individual_meter';

export interface Condo {
  id: string;
  name: string;
  monthlyFee: number;
  address: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  condoId?: string;
  baseRent: number;
  status: PropertyStatus;
}

export interface Tenant {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  propertyId: string;
  entryDate: string;
  rentValue: number;
}

export interface Maintenance {
  id: string;
  propertyId: string;
  propertyName: string;
  description: string;
  category: 'eletrica' | 'hidraulica' | 'pintura' | 'estrutura' | 'outros';
  status: 'pendente' | 'em_andamento' | 'concluido';
  priority: 'baixa' | 'media' | 'alta';
  date: string;
  cost?: number;
}

export interface Bill {
  id: string;
  propertyId: string;
  type: 'energy' | 'water' | 'iptu' | 'extra';
  month: string;
  year: number;
  billingMethod: BillingType;
  totalValue: number;
  calculatedValue: number;
  status: 'pago' | 'pendente' | 'atrasado';
  details?: {
    residents?: number;
    previousReading?: number;
    currentReading?: number;
    kwhPrice?: number;
  };
}