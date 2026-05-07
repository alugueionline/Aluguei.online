import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { Calculator, Users } from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  bill?: any;
}

export const BillingModal = ({ isOpen, onClose, onSave, bill }: BillingModalProps) => {
  const isEdit = !!bill;
  const [type, setType] = useState(bill?.type || 'energia');
  const [propertyId, setPropertyId] = useState(bill?.propertyId || "1");
  const [date, setDate] = useState(`${bill?.year || 2024}-${bill?.month || '06'}`);
  const [totalValue, setTotalValue] = useState(bill?.totalValue?.toString() || '');
  const [billingMethod, setBillingMethod] = useState<'fixo' | 'por_pessoa'>(bill?.billingMethod || 'fixo');
  const [residents, setResidents] = useState(bill?.residents?.toString() || '1');
  const [calculated, setCalculated] = useState<number>(bill?.calculatedValue || 0);

  useEffect(() => {
    if (isOpen) {
      setType(bill?.type || 'energia');
      setPropertyId(bill?.propertyId || "1");
      setDate(`${bill?.year || 2024}-${bill?.month || '06'}`);
      setTotalValue(bill?.totalValue?.toString() || '');
      setBillingMethod(bill?.billingMethod || 'fixo');
      setResidents(bill?.residents?.toString() || '1');
    }
  }, [isOpen, bill]);

  useEffect(() => {
    const val = parseFloat(totalValue) || 0;
    const res = parseInt(residents) || 1;
    
    if (billingMethod === 'por_pessoa') {
      setCalculated(val / res);
    } else {
      setCalculated(val);
    }
  }, [totalValue, billingMethod, residents]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [year, month] = date.split('-');
    
    onSave({
      type,
      propertyId,
      month,
      year: parseInt(year),
      totalValue: parseFloat(totalValue),
      billingMethod,
      residents: parseInt(residents),
      calculatedValue: calculated
    });

    showSuccess(isEdit ? 'Conta atualizada!' : 'Conta lançada com sucesso!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento de Conta'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="iptu">IPTU</SelectItem>
                  <SelectItem value="extra">Taxa Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imóvel</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Apto 101</SelectItem>
                  <SelectItem value="2">Casa 02</SelectItem>
                  <SelectItem value="3">Kitnet A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Método de Cobrança</Label>
              <Select value={billingMethod} onValueChange={(v: any) => setBillingMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Valor Fixo</SelectItem>
                  <SelectItem value="por_pessoa">Rateio por Pessoa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mês/Ano de Referência</Label>
              <Input 
                type="month" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{billingMethod === 'por_pessoa' ? 'Valor Total da Fatura (R$)' : 'Valor da Conta (R$)'}</Label>
              <Input 
                type="number" 
                step="0.01"
                value={totalValue} 
                onChange={(e) => setTotalValue(e.target.value)} 
                placeholder="0,00" 
                required 
              />
            </div>
            {billingMethod === 'por_pessoa' && (
              <div className="space-y-2">
                <Label>Nº de Residentes</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="number" 
                    value={residents} 
                    onChange={(e) => setResidents(e.target.value)} 
                    className="pl-10"
                    min="1"
                    required 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-blue-700">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">
                {billingMethod === 'por_pessoa' ? 'Valor por Pessoa' : 'Valor Calculado'}
              </span>
            </div>
            <span className="text-lg font-bold text-blue-900">R$ {calculated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEdit ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};