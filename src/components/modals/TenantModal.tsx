import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: any;
}

export const TenantModal = ({ isOpen, onClose, tenant }: TenantModalProps) => {
  const isEdit = !!tenant;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Inquilino' : 'Novo Inquilino'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); showSuccess('Salvo!'); onClose(); }} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input defaultValue={tenant?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input placeholder="000.000.000-00" defaultValue={tenant?.cpf} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" defaultValue={tenant?.phone} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Imóvel Vinculado</Label>
            <Select defaultValue={tenant?.property}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um imóvel disponível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apto 101">Apto 101</SelectItem>
                <SelectItem value="Casa 02">Casa 02</SelectItem>
                <SelectItem value="Kitnet A">Kitnet A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Entrada</Label>
              <Input type="date" defaultValue={tenant?.entryDate} />
            </div>
            <div className="space-y-2">
              <Label>Valor do Aluguel (R$)</Label>
              <Input type="number" defaultValue={tenant?.rent} />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};