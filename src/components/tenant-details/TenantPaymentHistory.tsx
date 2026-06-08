"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  RotateCcw, 
  Trash2, 
  Edit2,
  Loader2, 
  CalendarClock,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PartialPaymentModal } from '@/components/modals/PartialPaymentModal';

interface TenantPaymentHistoryProps {
  groupedHistory: any[];
  expandedMonths: Record<string, boolean>;
  onToggleMonth: (key: string) => void;
  historyFilter: 'all' | 'pending' | 'paid';
  onFilterChange: (filter: 'all' | 'pending' | 'paid') => void;
  processingBillId: string | null;
  onMarkAsPaid: (bill: any) => void;
  onRevertPayment: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
  onEditBill?: (bill: any) => void;
  activeContracts: any[];
  isBillOverdue: (bill: any, dueDay: number) => boolean;
}

export const TenantPaymentHistory = ({
  groupedHistory,
  expandedMonths,
  onToggleMonth,
  historyFilter,
  onFilterChange,
  processingBillId,
  onMarkAsPaid,
  onRevertPayment,
  onDeleteBill,
  onEditBill,
  activeContracts,
  isBillOverdue
}: TenantPaymentHistoryProps) => {
  const [selectedBillForPartial, setSelectedBillForPartial] = useState<any>(null);
  const [isPartialModalOpen, setIsPartialModalOpen] = useState(false);

  const getBillDescription = (bill: any) => {
    if (bill.description) return bill.description;
    
    const type = bill.type?.toLowerCase();
    if (type === 'multa') return 'Multa por atraso de pagamento';
    if (type === 'juros') return 'Juros de mora pro-rata die';
    if (type === 'multa_juros') return 'Multa e Juros de Mora acumulados';
    if (type === 'manutencao') return 'Reparo ou manutenção de imóvel';
    if (type === 'aluguel') return 'Mensalidade de locação';
    return `Cobrança de ${bill.type}`;
  };

  const getMonthName = (monthStr: string) => {
    const months: Record<string, string> = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    return months[monthStr] || monthStr;
  };

  const handleOpenPartialPayment = (bill: any) => {
    setSelectedBillForPartial(bill);
    setIsPartialModalOpen(true);
  };

  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg font-black tracking-tight">Histórico de Pagamentos</CardTitle>
        </div>
        
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto">
          <button 
            onClick={() => onFilterChange('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
              historyFilter === 'all' ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Todos
          </button>
          <button 
            onClick={() => onFilterChange('pending')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
              historyFilter === 'pending' ? "bg-white shadow-sm text-rose-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Pendentes
          </button>
          <button 
            onClick={() => onFilterChange('paid')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
              historyFilter === 'paid' ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Pagos
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {groupedHistory.length > 0 ? (
          groupedHistory.map((group) => {
            const isExpanded = !!expandedMonths[group.key];
            
            return (
              <div 
                key={group.key} 
                className={cn(
                  "border rounded-[2rem] overflow-hidden transition-all",
                  group.status === 'atrasado' ? "border-rose-100 bg-rose-50/10" : "border-slate-100 bg-white"
                )}
              >
                <div 
                  onClick={() => onToggleMonth(group.key)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                      group.status === 'pago' ? "bg-emerald-50 text-emerald-600" :
                      group.status === 'atrasado' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    )}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base tracking-tight">
                        {getMonthName(group.month)} de {group.year}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {group.bills.length} {group.bills.length === 1 ? 'lançamento' : 'lançamentos'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] text-slate-400 font-black uppercase">Total do Mês</p>
                      <p className="text-sm font-black text-slate-900">
                        R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {group.paid > 0 && group.paid < group.total && (
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">
                          Pago: R$ {group.paid.toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase",
                        group.status === 'pago' ? "bg-emerald-50 text-emerald-700" :
                        group.status === 'atrasado' ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {group.status === 'pago' ? 'Tudo Pago' : group.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                      </Badge>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-black text-[9px] uppercase tracking-widest p-4 pl-6">Tipo / Descrição</TableHead>
                          <TableHead className="font-black text-[9px] uppercase tracking-widest p-4">Valor</TableHead>
                          <TableHead className="font-black text-[9px] uppercase tracking-widest p-4">Status</TableHead>
                          <TableHead className="text-right font-black text-[9px] uppercase tracking-widest p-4 pr-6">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.bills.map((bill: any) => {
                          const contract = activeContracts.find((c: any) => c.property_id === bill.property_id);
                          const isAtrasado = isBillOverdue(bill, contract?.due_day || 5);

                          return (
                            <TableRow key={bill.id} className="border-slate-100 hover:bg-white transition-colors">
                              <TableCell className="p-4 pl-6">
                                <span className="capitalize block font-bold text-slate-800 text-sm">{bill.type === 'multa_juros' ? 'Multa e Juros' : bill.type}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{getBillDescription(bill)}</span>
                              </TableCell>
                              <TableCell className="p-4">
                                <span className="font-black text-slate-900 text-sm">
                                  R$ {Number(bill.total_value || bill.calculated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </TableCell>
                              <TableCell className="p-4">
                                <Badge className={cn(
                                  "border-none px-2.5 py-0.5 rounded-md font-black text-[9px] uppercase", 
                                  bill.status === 'pago' ? "bg-emerald-50 text-emerald-700" : 
                                  isAtrasado ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                                )}>
                                  {bill.status === 'pago' ? 'Pago' : isAtrasado ? 'Atrasado' : 'Pendente'}
                                </Badge>
                              </TableCell>
                              <TableCell className="p-4 pr-6 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {bill.status !== 'pago' && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50" 
                                        onClick={() => handleOpenPartialPayment(bill)} 
                                        disabled={processingBillId === bill.id} 
                                        title="Pagar Parcialmente"
                                      >
                                        <DollarSign className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50" 
                                        onClick={() => onMarkAsPaid(bill)} 
                                        disabled={processingBillId === bill.id} 
                                        title="Dar Baixa Integral"
                                      >
                                        {processingBillId === bill.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                      </Button>
                                    </>
                                  )}
                                  {bill.status === 'pago' && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50" 
                                      onClick={() => onRevertPayment(bill.id)} 
                                      disabled={processingBillId === bill.id} 
                                      title="Reverter"
                                    >
                                      {processingBillId === bill.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                    </Button>
                                  )}
                                  {!bill.isAutoGenerated && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50" 
                                        onClick={() => onEditBill?.(bill)} 
                                        disabled={processingBillId === bill.id} 
                                        title="Editar Lançamento"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50" 
                                        onClick={() => onDeleteBill(bill.id)} 
                                        disabled={processingBillId === bill.id} 
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <CalendarClock className="w-10 h-10 opacity-20" />
              <p className="text-sm font-bold">Nenhum histórico ou pendência encontrada para o filtro selecionado.</p>
            </div>
          </div>
        )}
      </CardContent>

      {selectedBillForPartial && (
        <PartialPaymentModal 
          isOpen={isPartialModalOpen}
          onClose={() => {
            setIsPartialModalOpen(false);
            setSelectedBillForPartial(null);
          }}
          bill={selectedBillForPartial}
          tenantId={groupedHistory[0]?.bills[0]?.tenant_id}
          onSuccess={() => {}}
        />
      )}
    </Card>
  );
};