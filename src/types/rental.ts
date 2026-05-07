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
  name: string;
  type: PropertyType;
  address: string;
  condoId?: string;
  baseRent: number;
  status: PropertyStatus;
  imageUrl?: string;
  financialConfig?: FinancialConfig; // Specific rules per property
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