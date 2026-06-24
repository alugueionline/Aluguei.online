"use client";

import { isBefore, parseISO, startOfDay, differenceInDays } from 'date-fns';

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
  // Se for o mês atual e o dia de hoje chegou ou passou do vencimento, está atrasado
  if (billYear === currentYear && billMonth === currentMonth && currentDay >= dueDay) return true;

  return false;
};

/**
 * Retorna o valor do aluguel projetado restante para o mês atual.
 * Ajustado para lidar com o caso do Edison (Entrada 28/06 -> Primeira cobrança 28/07).
 */
export const getProjectedRent = (contract: any, bills: any[]) => {
  const now = startOfDay(new Date());
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear();

  if (!contract.start_date) return 0;

  const startDate = startOfDay(parseISO(contract.start_date));
  
  // Se o contrato ainda não começou, não projeta nada.
  if (isBefore(now, startDate)) return 0;

  // LÓGICA EDISON: Se ele entrou este mês (mês 06) mas o dia de entrada (28) 
  // é igual ou posterior ao dia de vencimento (28), a primeira cobrança real é só no mês 07.
  const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
  const startYear = startDate.getFullYear();
  const dueDay = contract.due_day || 5;

  if (currentMonth === startMonth && currentYear === startYear) {
    // Se estamos no mês de entrada e ele entrou no dia do vencimento ou depois,
    // não cobramos "aluguel cheio" este mês. A primeira fatura virá no mês seguinte.
    if (startDate.getDate() >= dueDay) {
      return 0;
    }
  }

  // Filtra lançamentos de aluguel já existentes
  const rentBills = bills.filter(b => 
    (b.property_id === contract.property_id || !b.property_id) && 
    (b.type === 'aluguel' || b.type === 'receita') && 
    Number(b.month) === Number(currentMonth) && 
    Number(b.year) === Number(currentYear)
  );

  const totalRentLaunched = rentBills.reduce((acc, b) => acc + Number(b.total_value || b.calculated_value || 0), 0);
  return Math.max(0, Number(contract.rent_value || 0) - totalRentLaunched);
};