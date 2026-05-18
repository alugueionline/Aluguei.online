"use client";

/**
 * Verifica se uma fatura está atrasada com base no dia de vencimento do contrato.
 */
export const isBillOverdue = (bill: any, dueDay: number = 5) => {
  if (bill.status === 'pago') return false;
  if (bill.status === 'atrasado') return true;

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const billMonth = parseInt(bill.month);
  const billYear = bill.year;

  // Se o ano for anterior, está atrasado
  if (billYear < currentYear) return true;
  // Se o ano for igual mas o mês for anterior, está atrasado
  if (billYear === currentYear && billMonth < currentMonth) return true;
  // Se for o mês atual e o dia de hoje passou do vencimento, está atrasado
  if (billYear === currentYear && billMonth === currentMonth && currentDay > dueDay) return true;

  return false;
};

/**
 * Retorna o valor do aluguel projetado para o mês atual se ainda não houver fatura criada.
 */
export const getProjectedRent = (contract: any, bills: any[]) => {
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear();

  // Verifica se já existe uma fatura de aluguel para este imóvel no mês atual
  const hasRentBill = bills.some(b => 
    b.property_id === contract.property_id && 
    b.type === 'aluguel' && 
    b.month === currentMonth && 
    b.year === currentYear
  );

  if (!hasRentBill) {
    return Number(contract.rent_value || 0);
  }

  return 0;
};

/**
 * Calcula o valor projetado de aluguel que já deveria ter sido pago mas não foi faturado.
 * (Mantido para compatibilidade se necessário)
 */
export const getProjectedOverdueRent = (contract: any, bills: any[]) => {
  const now = new Date();
  const currentDay = now.getDate();
  const dueDay = contract.due_day || 5;

  const projected = getProjectedRent(contract, bills);
  
  if (projected > 0 && currentDay > dueDay) {
    return projected;
  }

  return 0;
};