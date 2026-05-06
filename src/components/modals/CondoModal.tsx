import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';

interface CondoModalProps {
  isOpen: boolean;
  onClose: () => void;
  condo?: any;
}

export const CondoModal = ({ isOpen, onClose, condo }: CondoModalProps) => {
  const isEdit = !!condo;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(isEdit ? 'Condomínio atualizado!' : 'Condomínio cadastrado!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Condomínio' : 'Novo Condomínio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Condomínio</Label>
            <Input id="name" defaultValue={condo?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" defaultValue={condo?.address} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Taxa Mensal Padrão (R$)</Label>
            <Input id="fee" type="number" defaultValue={condo?.fee} required />
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