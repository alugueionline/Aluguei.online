export type PropertyType = 'casa' | 'apartamento' | 'kitnet';
export type PropertyStatus = 'disponivel' | 'alugado' | 'manutencao';
export type BillingType = 'fixo' | 'por_pessoa' | 'medidor_individual';

export interface FinancialConfig {
  fixedFine: number; // %
  monthlyInterest: number; // %
  gracePeriod: number; // days
  autoBilling: boolean;
}

export interface Condo {
  id: string;
  name: string;
  monthlyFee: number;
  address: string;
}

export interface Property {
  id: string;
  user_id: string;
  name: string;
  type: PropertyType;
  address: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  size_sqm: number;
  condo_name?: string;
  block?: string;
  tower?: string;
  unit_number?: string;
  floor?: string;
  base_rent: number;
  status: PropertyStatus;
  image_url?: string;
  created_at?: string;
}

export interface Tenant {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  propertyId: string;
  entryDate: string;
  contractStartDate: string;
  contractEndDate: string;
  rentValue: number;
  securityDeposit?: number;
  securityDepositDate?: string;
  status: 'ativo' | 'pendente' | 'encerrado';
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
  type: 'energia' | 'agua' | 'iptu' | 'extra' | 'aluguel';
  month: string;
  year: number;
  billingMethod: BillingType;
  totalValue: number;
  calculatedValue: number;
  status: 'pago' | 'pendente' | 'atrasado';
  dueDate?: string;
  paidDate?: string;
  lateDetails?: {
    daysLate: number;
    fineValue: number;
    interestValue: number;
    totalUpdated: number;
  };
  details?: {
    residents?: number;
    previousReading?: number;
    currentReading?: number;
    kwhPrice?: number;
    isApportionment?: boolean;
    apportionmentTotal?: number;
    participantsCount?: number;
  };
}