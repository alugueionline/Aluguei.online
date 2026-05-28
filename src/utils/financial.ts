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
 * Retorna o valor do aluguel projetado restante para o mês atual, abatendo qualquer pagamento parcial já lançado.
 */
export const getProjectedRent = (contract: any, bills: any[]) => {
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear();

  // Filtra todos os lançamentos de aluguel deste imóvel para o mês atual (pagos ou pendentes)
  const rentBills = bills.filter(b => 
    b.property_id === contract.property_id && 
    b.type === 'aluguel' && 
    b.month === currentMonth && 
    b.year === currentYear
  );

  // Soma todos os valores de aluguel já lançados para este mês
  const totalRentLaunched = rentBills.reduce((acc, b) => acc + Number(b.total_value || b.calculated_value || 0), 0);
  
  // Retorna a diferença restante do aluguel contratual
  return Math.max(0, Number(contract.rent_value || 0) - totalRentLaunched);
};