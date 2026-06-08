export type PropertyType = 'casa' | 'apartamento' | 'kitnet' | 'comercial' | 'terreno';
export type PropertyStatus = 'disponivel' | 'alugado' | 'manutencao';
export type BillingType = 'fixo' | 'por_pessoa' | 'consumo_kwh';

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
  condo_fee?: number;
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
  user_id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  property_id?: string;
  status: 'ativo' | 'pendente' | 'encerrado';
  contract_start_date?: string;
  contract_end_date?: string;
  due_day: number;
  residents_count: number;
}

export interface Contract {
  id: string;
  user_id: string;
  property_id: string;
  tenant_id: string;
  rent_value: number;
  start_date: string;
  duration_months: number;
  status: 'ativo' | 'pendente' | 'encerrado';
  due_day: number;
  created_at?: string;
}

export interface Bill {
  id: string;
  user_id: string;
  property_id?: string;
  tenant_id?: string;
  type: string;
  month: string;
  year: number;
  total_value: number;
  calculated_value?: number;
  fine_value?: number;
  interest_value?: number;
  status: 'pago' | 'pendente' | 'atrasado';
  billing_method?: BillingType;
  previous_reading?: number;
  current_reading?: number;
  kwh_price?: number;
  residents?: number;
  payment_date?: string;
  created_at?: string;
  description?: string;
}